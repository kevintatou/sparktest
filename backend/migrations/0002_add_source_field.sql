-- Add source field to test_definitions table
-- This will store the GitHub repository URL and file path for traceability

ALTER TABLE test_definitions ADD COLUMN source TEXT;

-- Create index for source field for better performance when filtering by source
CREATE INDEX idx_test_definitions_source ON test_definitions(source);