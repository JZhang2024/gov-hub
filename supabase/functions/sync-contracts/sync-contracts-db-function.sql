CREATE OR REPLACE FUNCTION sync_sam_contracts(data jsonb)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  contract_record jsonb;
  new_contract_id bigint;
  department_parts text[];
  updated_count integer := 0;
  inserted_count integer := 0;
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
        solicitation_number = EXCLUDED.solicitation_number,
        department = EXCLUDED.department,
        sub_tier = EXCLUDED.sub_tier,
        office = EXCLUDED.office,
        posted_date = EXCLUDED.posted_date,
        type = EXCLUDED.type,
        base_type = EXCLUDED.base_type,
        archive_type = EXCLUDED.archive_type,
        archive_date = EXCLUDED.archive_date,
        set_aside_description = EXCLUDED.set_aside_description,
        set_aside_code = EXCLUDED.set_aside_code,
        response_deadline = EXCLUDED.response_deadline,
        naics_code = EXCLUDED.naics_code,
        classification_code = EXCLUDED.classification_code,
        active = EXCLUDED.active,
        description = EXCLUDED.description,
        organization_type = EXCLUDED.organization_type,
        ui_link = EXCLUDED.ui_link,
        award = EXCLUDED.award,
        resource_links = EXCLUDED.resource_links,
        updated_at = now(),
        last_sync_at = now()
      WHERE
        contracts.title != EXCLUDED.title OR
        contracts.solicitation_number IS DISTINCT FROM EXCLUDED.solicitation_number OR
        contracts.department IS DISTINCT FROM EXCLUDED.department OR
        contracts.sub_tier IS DISTINCT FROM EXCLUDED.sub_tier OR
        contracts.office IS DISTINCT FROM EXCLUDED.office OR
        contracts.posted_date IS DISTINCT FROM EXCLUDED.posted_date OR
        contracts.type IS DISTINCT FROM EXCLUDED.type OR
        contracts.base_type IS DISTINCT FROM EXCLUDED.base_type OR
        contracts.archive_type IS DISTINCT FROM EXCLUDED.archive_type OR
        contracts.archive_date IS DISTINCT FROM EXCLUDED.archive_date OR
        contracts.set_aside_description IS DISTINCT FROM EXCLUDED.set_aside_description OR
        contracts.set_aside_code IS DISTINCT FROM EXCLUDED.set_aside_code OR
        contracts.response_deadline IS DISTINCT FROM EXCLUDED.response_deadline OR
        contracts.naics_code IS DISTINCT FROM EXCLUDED.naics_code OR
        contracts.classification_code IS DISTINCT FROM EXCLUDED.classification_code OR
        contracts.active IS DISTINCT FROM EXCLUDED.active OR
        contracts.description IS DISTINCT FROM EXCLUDED.description OR
        contracts.organization_type IS DISTINCT FROM EXCLUDED.organization_type OR
        contracts.ui_link IS DISTINCT FROM EXCLUDED.ui_link OR
        contracts.award IS DISTINCT FROM EXCLUDED.award OR
        contracts.resource_links IS DISTINCT FROM EXCLUDED.resource_links
      RETURNING id INTO new_contract_id;

      -- If we got new_contract_id, it means either insert or update happened
      IF FOUND THEN
        -- Handle addresses
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