-- First add our search term processing function
CREATE OR REPLACE FUNCTION process_search_terms(search_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    processed TEXT;
BEGIN
    -- Handle null input
    IF search_text IS NULL OR trim(search_text) = '' THEN
        RETURN NULL;
    END IF;

    -- Remove special characters that could break tsquery
    processed := regexp_replace(search_text, '[!@#$%^&*()+=\[\]{};:''"",.<>?~/\\|]', ' ', 'g');
    
    -- Convert multiple spaces to single space
    processed := regexp_replace(processed, '\s+', ' ', 'g');
    
    -- Trim whitespace
    processed := trim(processed);
    
    -- Split into words, add :* to each for partial matching, and join with &
    processed := array_to_string(
        ARRAY(
            SELECT word || ':*'
            FROM unnest(string_to_array(processed, ' ')) AS word
            WHERE length(word) > 0
        ),
        ' & '
    );
    
    RETURN processed;
END;
$$;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS contracts_title_trgm_idx ON contracts USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS contracts_solnum_trgm_idx ON contracts USING gin (solicitation_number gin_trgm_ops);
CREATE INDEX IF NOT EXISTS contracts_department_trgm_idx ON contracts USING gin (department gin_trgm_ops);
CREATE INDEX IF NOT EXISTS contracts_subtier_trgm_idx ON contracts USING gin (sub_tier gin_trgm_ops);
CREATE INDEX IF NOT EXISTS contracts_office_trgm_idx ON contracts USING gin (office gin_trgm_ops);

-- Grant permission
GRANT EXECUTE ON FUNCTION process_search_terms(TEXT) TO authenticated;