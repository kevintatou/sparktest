-- Migration to add origin and k8s_ref fields to test_runs table
-- This supports tracking whether runs were created via API or CRD

-- Create enum type for origin
CREATE TYPE run_origin AS ENUM ('api', 'crd');

-- Add origin column with default value 'api'
ALTER TABLE test_runs 
ADD COLUMN origin run_origin NOT NULL DEFAULT 'api';

-- Add k8s_ref columns (namespace and name from CRD)
ALTER TABLE test_runs
ADD COLUMN k8s_ref_namespace TEXT,
ADD COLUMN k8s_ref_name TEXT;

-- Add index for filtering by origin
CREATE INDEX idx_test_runs_origin ON test_runs(origin);

-- Add index for k8s_ref lookup
CREATE INDEX idx_test_runs_k8s_ref ON test_runs(k8s_ref_namespace, k8s_ref_name) 
WHERE k8s_ref_namespace IS NOT NULL AND k8s_ref_name IS NOT NULL;
