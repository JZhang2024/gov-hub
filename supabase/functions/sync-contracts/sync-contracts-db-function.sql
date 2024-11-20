CREATE OR REPLACE FUNCTION sync_sam_contracts(data jsonb)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  contract_record jsonb;
  new_contract_id bigint;
  department_parts text[];
BEGIN
  -- Debug input
  RAISE NOTICE 'Input data type: %', jsonb_typeof(data);
  RAISE NOTICE 'Has opportunitiesData?: %', data ? 'opportunitiesData';
  
  -- Verify we have opportunities data
  IF data->>'opportunitiesData' IS NULL THEN
    RAISE NOTICE 'Full input data: %', data;
    RAISE EXCEPTION 'No opportunitiesData found in input';
  END IF;

  -- Debug opportunitiesData
  RAISE NOTICE 'opportunitiesData type: %', jsonb_typeof(data->'opportunitiesData');

  BEGIN
    -- Try to loop and log any errors
    FOR contract_record IN SELECT * FROM jsonb_array_elements(data->'opportunitiesData')
    LOOP
      RAISE NOTICE 'Processing contract: %', contract_record->>'noticeId';
      RAISE NOTICE 'Contract type: %', contract_record->>'type';
      RAISE NOTICE 'Posted date: %', contract_record->>'postedDate';
      RAISE NOTICE 'Response deadline: %', contract_record->>'responseDeadLine';
      RAISE NOTICE 'Archive date: %', contract_record->>'archiveDate';
      
      -- Debug each potentially problematic field
      RAISE NOTICE 'resourceLinks type: %', jsonb_typeof(contract_record->'resourceLinks');
      RAISE NOTICE 'pointOfContact type: %', jsonb_typeof(contract_record->'pointOfContact');

      -- Split department path into parts if it exists, otherwise use direct department fields
      IF contract_record->>'fullParentPathName' IS NOT NULL THEN
        department_parts := string_to_array(contract_record->>'fullParentPathName', '.');
      ELSE
        -- Handle the alternate format where department info is direct fields
        department_parts := ARRAY[
          contract_record->>'department',
          contract_record->>'subTier',
          contract_record->>'office'
        ];
      END IF;

      INSERT INTO contracts (
        notice_id,
        title,
        solicitation_number,
        department,
        sub_tier,
        office,
        posted_date,
        type,
        base_type,
        archive_type,
        archive_date,
        set_aside_description,
        set_aside_code,
        response_deadline,
        naics_code,
        classification_code,
        active,
        description,
        organization_type,
        ui_link,
        award,
        resource_links
      ) VALUES (
        contract_record->>'noticeId',
        contract_record->>'title',
        contract_record->>'solicitationNumber',
        department_parts[1],
        department_parts[2],
        department_parts[3],
        CASE 
          WHEN contract_record->>'postedDate' ~ '^\d{4}-\d{2}-\d{2}$' 
          THEN (contract_record->>'postedDate')::timestamp with time zone
          ELSE to_timestamp(contract_record->>'postedDate', 'YYYY-MM-DD"T"HH24:MI:SS')
        END,
        CASE 
          WHEN contract_record->>'type' = 'Presolicitation' THEN 'Presolicitation'::contract_type
          ELSE (contract_record->>'type')::contract_type
        END,
        contract_record->>'baseType',
        contract_record->>'archiveType',
        CASE 
          WHEN contract_record->>'archiveDate' IS NULL OR contract_record->>'archiveDate' = 'null' 
          THEN NULL
          WHEN contract_record->>'archiveDate' ~ '^\d{4}-\d{2}-\d{2}$' 
          THEN (contract_record->>'archiveDate')::timestamp with time zone
          ELSE to_timestamp(contract_record->>'archiveDate', 'YYYY-MM-DD"T"HH24:MI:SS')
        END,
        contract_record->>'typeOfSetAsideDescription',
        contract_record->>'typeOfSetAside',
        CASE 
          WHEN contract_record->>'responseDeadLine' IS NULL OR contract_record->>'responseDeadLine' = 'null' 
          THEN NULL
          WHEN contract_record->>'responseDeadLine' ~ '^\d{4}-\d{2}-\d{2}$' 
          THEN (contract_record->>'responseDeadLine')::timestamp with time zone
          ELSE to_timestamp(contract_record->>'responseDeadLine', 'YYYY-MM-DD"T"HH24:MI:SS')
        END,
        contract_record->>'naicsCode',
        contract_record->>'classificationCode',
        (contract_record->>'active' = 'Yes'),
        contract_record->>'description',
        contract_record->>'organizationType',
        contract_record->>'uiLink',
        contract_record->'award',
        CASE 
          WHEN jsonb_typeof(contract_record->'resourceLinks') = 'array' 
          THEN array(SELECT jsonb_array_elements_text(contract_record->'resourceLinks'))
          ELSE NULL
        END
      )
      ON CONFLICT (notice_id) DO UPDATE SET
        title = EXCLUDED.title,
        updated_at = now(),
        last_sync_at = now()
      RETURNING id INTO new_contract_id;

      -- Handle addresses
      -- First, delete existing addresses for this contract
      DELETE FROM contract_addresses WHERE contract_id = new_contract_id;
      
      -- Insert office address
      IF (contract_record->'officeAddress') IS NOT NULL THEN
        INSERT INTO contract_addresses (
          contract_id,
          address_type,
          city,
          state,
          zip,
          country_code
        ) VALUES (
          new_contract_id,
          'office',
          contract_record->'officeAddress'->>'city',
          contract_record->'officeAddress'->>'state',
          contract_record->'officeAddress'->>'zipcode',
          contract_record->'officeAddress'->>'countryCode'
        );
      END IF;

      -- Insert place of performance
      IF (contract_record->'placeOfPerformance') IS NOT NULL THEN
        INSERT INTO contract_addresses (
          contract_id,
          address_type,
          street_address,
          city,
          city_code,
          state,
          state_code,
          zip,
          country_code
        ) VALUES (
          new_contract_id,
          'performance',
          contract_record->'placeOfPerformance'->>'streetAddress',
          contract_record->'placeOfPerformance'->'city'->>'name',
          contract_record->'placeOfPerformance'->'city'->>'code',
          contract_record->'placeOfPerformance'->'state'->>'name',
          contract_record->'placeOfPerformance'->'state'->>'code',
          contract_record->'placeOfPerformance'->>'zip',
          contract_record->'placeOfPerformance'->'country'->>'code'
        );
      END IF;

      -- Handle contacts
      -- First, delete existing contacts for this contract
      DELETE FROM contract_contacts WHERE contract_id = new_contract_id;
      
      -- Insert new contacts if they exist
      IF (contract_record->'pointOfContact') IS NOT NULL THEN
        INSERT INTO contract_contacts (
          contract_id,
          contact_type,
          full_name,
          title,
          email,
          phone,
          fax
        )
        SELECT
          new_contract_id,
          contact->>'type',
          contact->>'fullName',
          contact->>'title',
          contact->>'email',
          contact->>'phone',
          contact->>'fax'
        FROM jsonb_array_elements(contract_record->'pointOfContact') AS contact;
      END IF;

    END LOOP;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error in loop. Last record processed: %', contract_record;
    RAISE NOTICE 'Error detail: %', SQLERRM;
    RAISE;
  END;

  RETURN 'Successfully synced ' || jsonb_array_length(data->'opportunitiesData')::text || ' contracts';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Fatal error. Last error: %', SQLERRM;
  RAISE;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION sync_sam_contracts(jsonb) TO authenticated;