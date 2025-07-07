-- Add executor_id field to test_definitions table
ALTER TABLE test_definitions ADD COLUMN executor_id UUID REFERENCES test_executors(id) ON DELETE SET NULL;

-- Add executor_id field to test_runs table  
ALTER TABLE test_runs ADD COLUMN executor_id UUID REFERENCES test_executors(id) ON DELETE SET NULL;

-- Add index for better performance
CREATE INDEX idx_test_definitions_executor_id ON test_definitions(executor_id);
CREATE INDEX idx_test_runs_executor_id ON test_runs(executor_id);