-- Create table for document summaries
CREATE TABLE contract_document_summaries (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  contract_id TEXT REFERENCES contracts(notice_id),
  document_url TEXT NOT NULL,
  content TEXT, -- Base64 document content
  summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(contract_id, document_url)
);

-- Index for faster lookups
CREATE INDEX idx_document_summaries_lookup 
ON contract_document_summaries(contract_id, document_url);