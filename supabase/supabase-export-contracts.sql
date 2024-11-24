CREATE OR REPLACE FUNCTION export_contracts(
  filters jsonb DEFAULT NULL,
  selected_fields contract_export_fields DEFAULT NULL,
  export_scope TEXT DEFAULT 'current',
  page_number INTEGER DEFAULT 1,
  page_size INTEGER DEFAULT 25
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
  query_text TEXT;
  total_count INTEGER;
BEGIN
  -- Start building the query
  query_text := 'WITH filtered_contracts AS (
    SELECT c.*
    FROM contracts c
    WHERE 1=1';

  -- Add filter conditions based on filters jsonb
  IF filters IS NOT NULL THEN
    -- Add enhanced search filter
    IF filters ? 'search' AND (filters->>'search') IS NOT NULL AND (filters->>'search') != '' THEN
        query_text := query_text || format('
            AND (
                search_vector @@ to_tsquery(''english'', %L) OR
                title ILIKE ''%%'' || %L || ''%%'' OR
                solicitation_number ILIKE ''%%'' || %L || ''%%'' OR
                department ILIKE ''%%'' || %L || ''%%'' OR
                sub_tier ILIKE ''%%'' || %L || ''%%'' OR
                office ILIKE ''%%'' || %L || ''%%''
            )', 
            process_search_terms(filters->>'search'),
            filters->>'search',
            filters->>'search',
            filters->>'search',
            filters->>'search',
            filters->>'search'
        );
    END IF;

    -- Type filter
    IF filters ? 'type' AND jsonb_array_length(filters->'type') > 0 THEN
      query_text := query_text || ' AND c.type = ANY(ARRAY(SELECT jsonb_array_elements_text($1->''type'')))';
    END IF;

    -- Set-aside filter
    IF filters ? 'setAside' AND jsonb_array_length(filters->'setAside') > 0 THEN
      query_text := query_text || ' AND c.set_aside_code = ANY(ARRAY(SELECT jsonb_array_elements_text($1->''setAside'')))';
    END IF;

    -- Status filter
    IF filters ? 'status' AND jsonb_array_length(filters->'status') > 0 THEN
      query_text := query_text || ' AND (';
      query_text := query_text || '
        CASE 
          WHEN ''Active'' = ANY(ARRAY(SELECT jsonb_array_elements_text($1->''status''))) THEN c.active = true
          WHEN ''Archived'' = ANY(ARRAY(SELECT jsonb_array_elements_text($1->''status''))) THEN c.active = false
          WHEN ''Awarded'' = ANY(ARRAY(SELECT jsonb_array_elements_text($1->''status''))) THEN c.award IS NOT NULL
          ELSE false
        END
      )';
    END IF;

    -- Date range filter
    IF filters ? 'dateRange' THEN
      IF filters->'dateRange' ? 'start' AND (filters->'dateRange'->>'start') IS NOT NULL THEN
        query_text := query_text || ' AND c.posted_date >= ($1->''dateRange''->>''start'')::timestamp';
      END IF;
      
      IF filters->'dateRange' ? 'end' AND (filters->'dateRange'->>'end') IS NOT NULL THEN
        query_text := query_text || ' AND c.posted_date <= ($1->''dateRange''->>''end'')::timestamp';
      END IF;
    END IF;

    -- Value range filter
    IF filters ? 'valueRange' THEN
      IF filters->'valueRange' ? 'min' AND (filters->'valueRange'->>'min')::numeric IS NOT NULL THEN
        query_text := query_text || ' AND (c.award->>''amount'')::numeric >= ($1->''valueRange''->>''min'')::numeric';
      END IF;
      
      IF filters->'valueRange' ? 'max' AND (filters->'valueRange'->>'max')::numeric IS NOT NULL THEN
        query_text := query_text || ' AND (c.award->>''amount'')::numeric <= ($1->''valueRange''->>''max'')::numeric';
      END IF;
    END IF;
  END IF;

  -- Close the CTE and start main selection
  query_text := query_text || ')
    SELECT jsonb_agg(
      jsonb_build_object(
        ''noticeId'', fc.notice_id,
        ''data'', jsonb_build_object(
          ''basic'', CASE WHEN $2.basic THEN
            jsonb_build_object(
              ''title'', fc.title,
              ''solicitationNumber'', fc.solicitation_number,
              ''type'', fc.type,
              ''active'', fc.active,
              ''department'', fc.department,
              ''subTier'', fc.sub_tier,
              ''office'', fc.office
            )
          ELSE NULL END,
          
          ''dates'', CASE WHEN $2.dates THEN
            jsonb_build_object(
              ''postedDate'', fc.posted_date,
              ''responseDeadline'', fc.response_deadline,
              ''archiveDate'', fc.archive_date
            )
          ELSE NULL END,
          
          ''setAside'', CASE WHEN $2.set_aside THEN
            jsonb_build_object(
              ''type'', fc.set_aside_code,
              ''description'', fc.set_aside_description
            )
          ELSE NULL END,
          
          ''award'', CASE WHEN $2.awards AND fc.award IS NOT NULL THEN
            fc.award
          ELSE NULL END,
          
          ''contacts'', CASE WHEN $2.contacts THEN
            (SELECT jsonb_agg(
              jsonb_build_object(
                ''type'', cc.contact_type,
                ''name'', cc.full_name,
                ''email'', cc.email,
                ''phone'', cc.phone
              )
            )
            FROM contract_contacts cc
            WHERE cc.contract_id = fc.id)
          ELSE NULL END,
          
          ''addresses'', CASE WHEN $2.addresses THEN
            jsonb_build_object(
              ''performance'', (
                SELECT jsonb_build_object(
                  ''city'', ca.city,
                  ''state'', ca.state,
                  ''zip'', ca.zip,
                  ''address'', ca.street_address
                )
                FROM contract_addresses ca
                WHERE ca.contract_id = fc.id AND ca.address_type = ''performance''
                LIMIT 1
              ),
              ''office'', (
                SELECT jsonb_build_object(
                  ''city'', ca.city,
                  ''state'', ca.state,
                  ''zip'', ca.zip
                )
                FROM contract_addresses ca
                WHERE ca.contract_id = fc.id AND ca.address_type = ''office''
                LIMIT 1
              )
            )
          ELSE NULL END,
          
          ''links'', CASE WHEN $2.links THEN
            jsonb_build_object(
              ''uiLink'', fc.ui_link,
              ''resourceLinks'', fc.resource_links
            )
          ELSE NULL END
        )
      )
    ) as export_data,
    COUNT(*) OVER() as total_count
    FROM filtered_contracts fc';

  -- Add pagination if scope is 'current'
  IF export_scope = 'current' THEN
    query_text := query_text || '
      LIMIT $4
      OFFSET $3';
  END IF;

  -- Log the generated query for debugging
  RAISE NOTICE 'Generated query: %', query_text;
  
  -- Log the parameters
  RAISE NOTICE 'Parameters: filters=%, selected_fields=%, page_size=%, offset=%',
    filters,
    selected_fields,
    page_size,
    (page_number - 1) * page_size;

  -- Execute the query
  EXECUTE query_text
  INTO result, total_count
  USING 
    filters,
    selected_fields,
    (page_number - 1) * page_size,
    page_size;

  -- Return the result with metadata
  RETURN jsonb_build_object(
    'data', COALESCE(result, '[]'::jsonb),
    'totalCount', total_count,
    'pageSize', page_size,
    'pageNumber', page_number,
    'scope', export_scope
  );

EXCEPTION WHEN OTHERS THEN
  -- Log any errors
  RAISE NOTICE 'Error in export_contracts: %, SQLSTATE: %', SQLERRM, SQLSTATE;
  RAISE;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION export_contracts(jsonb, contract_export_fields, text, integer, integer) TO authenticated;