
DECLARE
  contract_record jsonb;
  contract_id bigint;
  department_parts text[];
BEGIN
  -- Loop through each contract in the data
  FOR contract_record IN SELECT jsonb_array_elements(data->'opportunitiesData')
  LOOP
    -- Split department path into parts
    department_parts := string_to_array(contract_record->>'fullParentPathName', '.');

    -- Upsert into contracts table
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
      department_parts[1], -- First part of the path
      department_parts[2], -- Second part of the path
      department_parts[3], -- Third part of the path
      (contract_record->>'postedDate')::timestamp with time zone,
      (contract_record->>'type')::contract_type,
      contract_record->>'baseType',
      contract_record->>'archiveType',
      nullif(contract_record->>'archiveDate', 'null')::timestamp with time zone,
      contract_record->>'typeOfSetAsideDescription',
      contract_record->>'typeOfSetAside',
      nullif(contract_record->>'responseDeadLine', 'null')::timestamp with time zone,
      contract_record->>'naicsCode',
      contract_record->>'classificationCode',
      (contract_record->>'active' = 'Yes'),
      contract_record->>'description',
      contract_record->>'organizationType',
      contract_record->>'uiLink',
      contract_record->'award',
      array(SELECT jsonb_array_elements_text(contract_record->'resourceLinks'))
    )
    ON CONFLICT (notice_id) DO UPDATE SET
      title = EXCLUDED.title,
      updated_at = now(),
      last_sync_at = now()
    RETURNING id INTO contract_id;

    -- Handle addresses
    -- First, delete existing addresses for this contract
    DELETE FROM contract_addresses WHERE contract_id = contract_id;
    
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
        contract_id,
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
        contract_id,
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
    DELETE FROM contract_contacts WHERE contract_id = contract_id;
    
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
        contract_id,
        contact->>'type',
        contact->>'fullName',
        contact->>'title',
        contact->>'email',
        contact->>'phone',
        contact->>'fax'
      FROM jsonb_array_elements(contract_record->'pointOfContact') AS contact;
    END IF;

  END LOOP;

  RETURN 'Successfully synced ' || jsonb_array_length(data->'opportunitiesData')::text || ' contracts';
END;