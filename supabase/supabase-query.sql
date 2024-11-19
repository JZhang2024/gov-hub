-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "vector";

CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- For fuzzy text search
-- Enums for consistent typing
CREATE TYPE contract_status AS ENUM(
  'Active',
  'Pending',
  'Archived',
  'Awarded',
  'Cancelled'
);

CREATE TYPE contract_type AS ENUM(
  'Solicitation',
  'Award Notice',
  'Justification',
  'Intent to Bundle',
  'Pre-Solicitation',
  'Combined Synopsis/Solicitation',
  'Sale of Surplus Property',
  'Fair Opportunity / Limited Sources Justification',
  'Foreign Government Standard',
  'Special Notice',
  'Sources Sought'
);

-- Main contracts table
CREATE TABLE
  contracts (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    notice_id TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    solicitation_number TEXT,
    -- Breaking down the fullParentPathName for better querying
    department TEXT,
    sub_tier TEXT,
    office TEXT,
    -- Core fields
    posted_date TIMESTAMP WITH TIME ZONE NOT NULL,
    TYPE contract_type,
    base_type TEXT,
    archive_type TEXT,
    archive_date TIMESTAMP WITH TIME ZONE,
    set_aside_description TEXT,
    set_aside_code TEXT,
    response_deadline TIMESTAMP WITH TIME ZONE,
    naics_code TEXT,
    classification_code TEXT,
    active BOOLEAN DEFAULT TRUE,
    description TEXT,
    organization_type TEXT,
    ui_link TEXT,
    -- Embedded JSON fields for nested data
    award jsonb,
    resource_links TEXT[],
    -- Full-text search vector
    search_vector tsvector GENERATED ALWAYS AS (
      SETWEIGHT(TO_TSVECTOR('english', COALESCE(title, '')), 'A') || SETWEIGHT(
        TO_TSVECTOR('english', COALESCE(description, '')),
        'B'
      ) || SETWEIGHT(
        TO_TSVECTOR('english', COALESCE(department, '')),
        'C'
      ) || SETWEIGHT(
        TO_TSVECTOR('english', COALESCE(sub_tier, '')),
        'C'
      ) || SETWEIGHT(TO_TSVECTOR('english', COALESCE(office, '')), 'C')
    ) STORED,
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_sync_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

-- Separate tables for normalized data
CREATE TABLE
  contract_addresses (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    contract_id BIGINT REFERENCES contracts (id) ON DELETE CASCADE,
    address_type TEXT NOT NULL, -- 'office' or 'performance'
    street_address TEXT,
    city TEXT,
    city_code TEXT,
    state TEXT,
    state_code TEXT,
    zip TEXT,
    country TEXT,
    country_code TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

CREATE TABLE
  contract_contacts (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    contract_id BIGINT REFERENCES contracts (id) ON DELETE CASCADE,
    contact_type TEXT NOT NULL,
    full_name TEXT,
    title TEXT,
    email TEXT,
    phone TEXT,
    fax TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

-- Indexes for common query patterns
CREATE INDEX contracts_posted_date_idx ON contracts USING btree (posted_date DESC);

CREATE INDEX contracts_response_deadline_idx ON contracts USING btree (response_deadline);

CREATE INDEX contracts_naics_code_idx ON contracts USING btree (naics_code);

CREATE INDEX contracts_set_aside_code_idx ON contracts USING btree (set_aside_code);

CREATE INDEX contracts_department_idx ON contracts USING btree (department);

CREATE INDEX contracts_search_vector_idx ON contracts USING gin (search_vector);

CREATE INDEX contracts_title_trgm_idx ON contracts USING gin (title gin_trgm_ops);

-- Function to update updated_at timestamp
CREATE
OR REPLACE FUNCTION update_updated_at () RETURNS TRIGGER AS $$
begin
   new.updated_at = now();
   return new;
end;
$$ LANGUAGE plpgsql;

-- Trigger to call the function before update
CREATE TRIGGER update_contracts_updated_at BEFORE
UPDATE ON contracts FOR EACH ROW
EXECUTE PROCEDURE update_updated_at ();