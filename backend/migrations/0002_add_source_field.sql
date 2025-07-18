-- Add source field to test_definitions table
-- This will store the GitHub repository URL and path for traceability and improved sync tracking

ALTER TABLE test_definitions 
ADD COLUMN source TEXT;

-- Add index for better performance when querying by source
CREATE INDEX idx_test_definitions_source ON test_definitions(source);

-- Add a comment to explain the field
COMMENT ON COLUMN test_definitions.source IS 'GitHub repository URL and file path in format: https://github.com/owner/repo/blob/branch/path/to/file.json';