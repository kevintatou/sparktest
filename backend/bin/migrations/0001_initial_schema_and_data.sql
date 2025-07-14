-- Initial schema and data migration
-- This creates all tables and inserts all initial/mock data

-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create table for test executors
CREATE TABLE test_executors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    image TEXT NOT NULL,
    default_command TEXT NOT NULL,
    supported_file_types TEXT[] NOT NULL,
    environment_variables TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    icon TEXT
);

-- Create table for test definitions
CREATE TABLE test_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    image TEXT NOT NULL,
    commands TEXT[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    executor_id UUID REFERENCES test_executors(id) ON DELETE SET NULL
);

-- Create table for test runs
CREATE TABLE test_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    image TEXT NOT NULL,
    command TEXT[] NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Running', 'Completed', 'Failed', 'running', 'succeeded', 'failed')),
    created_at TIMESTAMPTZ DEFAULT now(),
    duration INTEGER,
    logs TEXT[],
    test_definition_id UUID REFERENCES test_definitions(id) ON DELETE SET NULL,
    executor_id UUID REFERENCES test_executors(id) ON DELETE SET NULL
);

-- Create table for test suites
CREATE TABLE test_suites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    execution_mode TEXT NOT NULL DEFAULT 'sequential',
    labels TEXT[] DEFAULT '{}',
    test_definition_ids UUID[] NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_test_definitions_executor_id ON test_definitions(executor_id);
CREATE INDEX idx_test_runs_executor_id ON test_runs(executor_id);
CREATE INDEX idx_test_runs_test_definition_id ON test_runs(test_definition_id);

-- Insert test executors
INSERT INTO test_executors (id, name, description, image, default_command, supported_file_types, environment_variables, icon)
VALUES 
    ('d1e7f50d-439b-486c-b8e2-33b6c07b3835', 'Postman', 'Run Postman collections using Newman', 'postman/newman:alpine', 'newman run collection.json', ARRAY['json'], ARRAY['API_KEY', 'BASE_URL'], '🧪'),
    ('2cfd5057-e17b-45ab-ada3-0a002d3a5eb1', 'K6', 'Load testing tool by Grafana', 'grafana/k6', 'k6 run script.js', ARRAY['js'], ARRAY['TOKEN', 'BASE_URL'], '📈');

-- Insert test definitions
INSERT INTO test_definitions (id, name, description, image, commands, created_at, executor_id)
VALUES 
    ('1e2814cd-801f-42d5-9e83-f697d96ed81a', 'aw', 'awd', 'awd', ARRAY['awd'], '2025-07-03 14:25:24.625213+02', NULL),
    ('8edcda0c-ff73-49fa-885c-594e661c16c3', 'SAPI Smokey Tests', 'Basic smoke test for the public API endpoints.', 'node:18-alpine', ARRAY['npm ci', 'npm run test:smoke'], '2025-06-30 21:49:05.842549+02', '2cfd5057-e17b-45ab-ada3-0a002d3a5eb1'),
    ('127274ab-d119-42e6-9bd0-a39dea73bfdd', 'Load Test', 'Simulates load using K6', 'grafana/k6', ARRAY['k6 run load-test.js'], '2025-06-06 22:52:55.065633+02', 'd1e7f50d-439b-486c-b8e2-33b6c07b3835'),
    ('16ffae28-54d6-4f24-900a-4ac1c2cb2476', 'SAPI Smoke Test', 'Basic smoke test for the public API endpoints.', 'node:18-alpine', ARRAY['npm ci', 'npm run test:smoke'], '2025-06-30 21:32:32.006292+02', 'd1e7f50d-439b-486c-b8e2-33b6c07b3835'),
    ('70e92383-2f9b-4d52-99ff-83d4a028b6fe', 'API Health Check', 'Checks if the API responds with 200', 'postman/newman:alpine', ARRAY['newman run api-tests.json'], '2025-06-06 22:52:55.065633+02', '2cfd5057-e17b-45ab-ada3-0a002d3a5eb1'),
    ('3aed5b98-925f-4f13-9a0e-6aa651de933d', 'API Smoke Test', 'Basic smoke test for the public API endpoints.', 'node:18-alpine', ARRAY['npm ci', 'npm run test:smoke'], '2025-06-30 21:16:34.56998+02', '2cfd5057-e17b-45ab-ada3-0a002d3a5eb1');

-- Insert test runs
INSERT INTO test_runs (id, name, image, command, status, created_at, duration, logs, test_definition_id, executor_id)
VALUES 
    ('fd071162-a736-4c47-b49b-13531a028b7e', 'test', 'busybox', ARRAY['echo hello'], 'failed', '2025-06-14 13:24:54.936137+02', NULL, NULL, '127274ab-d119-42e6-9bd0-a39dea73bfdd', 'd1e7f50d-439b-486c-b8e2-33b6c07b3835'),
    ('450dc9c1-5129-44fa-9790-2787e3212bd0', 'ewawe', 'busybox', ARRAY['echo hello'], 'failed', '2025-06-16 13:06:13.91663+02', NULL, NULL, '127274ab-d119-42e6-9bd0-a39dea73bfdd', 'd1e7f50d-439b-486c-b8e2-33b6c07b3835'),
    ('f9908940-c86e-40c3-9506-d563f411c018', 'API Health Check Run', 'postman/newman:alpine', ARRAY['newman run api-tests.json'], 'running', '2025-06-27 22:06:16.172577+02', 60, NULL, '70e92383-2f9b-4d52-99ff-83d4a028b6fe', '2cfd5057-e17b-45ab-ada3-0a002d3a5eb1'),
    ('54ebe563-aea1-478c-940b-ed628afeacf5', 'API Health Check Run', 'postman/newman:alpine', ARRAY['newman run api-tests.json'], 'running', '2025-06-27 23:15:06.827402+02', 60, NULL, '70e92383-2f9b-4d52-99ff-83d4a028b6fe', '2cfd5057-e17b-45ab-ada3-0a002d3a5eb1'),
    ('fe4e83be-bc65-4476-854e-8db1819051f1', 'API Health Check Run', 'postman/newman:alpine', ARRAY['newman run api-tests.json'], 'running', '2025-06-27 23:43:38.91294+02', 60, NULL, '70e92383-2f9b-4d52-99ff-83d4a028b6fe', '2cfd5057-e17b-45ab-ada3-0a002d3a5eb1'),
    ('04815faa-31fe-43ac-9888-13c08dabd008', 'API Health Check Run', 'postman/newman:alpine', ARRAY['newman run api-tests.json'], 'running', '2025-06-27 23:44:18.059811+02', 60, NULL, '70e92383-2f9b-4d52-99ff-83d4a028b6fe', '2cfd5057-e17b-45ab-ada3-0a002d3a5eb1'),
    ('836ed9be-6aff-420e-89c4-358e46e1c150', 'API Health Check Run', 'postman/newman:alpine', ARRAY['newman run api-tests.json'], 'running', '2025-06-28 22:04:59.720478+02', 60, NULL, '70e92383-2f9b-4d52-99ff-83d4a028b6fe', '2cfd5057-e17b-45ab-ada3-0a002d3a5eb1'),
    ('1e04eee3-1324-4338-96ec-ce10ba9f9b41', 'Load Test Run', 'grafana/k6', ARRAY['k6 run load-test.js'], 'running', '2025-06-28 22:09:07.532837+02', 60, NULL, '127274ab-d119-42e6-9bd0-a39dea73bfdd', 'd1e7f50d-439b-486c-b8e2-33b6c07b3835'),
    ('284eef62-9a9a-4b8a-a7d6-fe637bbe4d6b', 'Load Test Run', 'grafana/k6', ARRAY['k6 run load-test.js'], 'running', '2025-06-28 22:14:21.472316+02', 60, NULL, '127274ab-d119-42e6-9bd0-a39dea73bfdd', 'd1e7f50d-439b-486c-b8e2-33b6c07b3835'),
    ('4ce8b060-d56a-45e0-b919-bb4a406687fd', 'Load Test Run', 'grafana/k6', ARRAY['k6 run load-test.js'], 'running', '2025-06-28 22:15:22.67123+02', 60, NULL, '127274ab-d119-42e6-9bd0-a39dea73bfdd', 'd1e7f50d-439b-486c-b8e2-33b6c07b3835'),
    ('ac4c4ed7-8b85-466f-a8b4-13854615b965', 'Load Test Run', 'grafana/k6', ARRAY['k6 run load-test.js'], 'running', '2025-06-28 22:17:24.951449+02', 60, NULL, '127274ab-d119-42e6-9bd0-a39dea73bfdd', 'd1e7f50d-439b-486c-b8e2-33b6c07b3835'),
    ('239e8a7c-eab3-4a5d-8c46-7c2d5ae605f9', 'Load Test Run', 'grafana/k6', ARRAY['k6 run load-test.js'], 'running', '2025-06-28 22:24:15.568852+02', 60, NULL, '127274ab-d119-42e6-9bd0-a39dea73bfdd', 'd1e7f50d-439b-486c-b8e2-33b6c07b3835'),
    ('c2e46c6f-fea1-4e8e-88db-47994c2c6fc7', 'API Health Check Runwadawd', 'postman/newman:alpine', ARRAY['newman run api-tests.json'], 'running', '2025-06-28 22:43:29.783232+02', 60, NULL, '70e92383-2f9b-4d52-99ff-83d4a028b6fe', '2cfd5057-e17b-45ab-ada3-0a002d3a5eb1'),
    ('21f9763d-3f50-4b42-ba6f-2962a20f0863', 'API Health Check Runiojoi', 'postman/newman:alpine', ARRAY['newman run api-tests.json'], 'running', '2025-06-28 22:44:46.764628+02', 60, NULL, '70e92383-2f9b-4d52-99ff-83d4a028b6fe', '2cfd5057-e17b-45ab-ada3-0a002d3a5eb1'),
    ('2ad9a4fe-8fe2-412e-af99-4d5664cf8880', 'Load Test Run', 'grafana/k6', ARRAY['k6 run load-test.js'], 'failed', '2025-07-04 08:41:39.350334+02', 12, NULL, '127274ab-d119-42e6-9bd0-a39dea73bfdd', 'd1e7f50d-439b-486c-b8e2-33b6c07b3835'),
    ('3c6af45b-58ea-4c36-9e36-d44548c16d0f', 'awdawdawd', 'node:18-alpine', ARRAY['npm ci', 'npm run test:smoke'], 'failed', '2025-07-04 08:42:11.871201+02', 12, NULL, '8edcda0c-ff73-49fa-885c-594e661c16c3', '2cfd5057-e17b-45ab-ada3-0a002d3a5eb1');

-- Insert test suites
INSERT INTO test_suites (id, name, description, execution_mode, labels, test_definition_ids, created_at)
VALUES 
    ('9601acf1-39ad-4744-8f11-4a44a0defd93', 'tgtg', 'er', 'sequential', ARRAY[]::TEXT[], ARRAY['70e92383-2f9b-4d52-99ff-83d4a028b6fe']::UUID[], '2025-07-02 22:36:14.434+02'),
    ('4554ca6a-78a4-4561-8155-16537caaa6e8', 'test', 'test', 'sequential', ARRAY['awwa'], ARRAY['127274ab-d119-42e6-9bd0-a39dea73bfdd']::UUID[], '2025-07-03 09:49:26.833+02');
