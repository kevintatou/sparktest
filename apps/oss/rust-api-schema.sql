-- Database schema for Rust API backend
-- This is a PostgreSQL schema that your Rust API should implement

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Test Definitions table
CREATE TABLE IF NOT EXISTS test_definitions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  image TEXT NOT NULL,
  commands TEXT[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  executor_id TEXT,
  variables JSONB DEFAULT '{}',
  labels TEXT[] DEFAULT '{}'
);

-- Test Runs table
CREATE TABLE IF NOT EXISTS test_runs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  image TEXT NOT NULL,
  command TEXT[] NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('running', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  test_definition_id TEXT REFERENCES test_definitions(id),
  executor_id TEXT,
  suite_id TEXT,
  variables JSONB DEFAULT '{}',
  artifacts TEXT[] DEFAULT '{}',
  duration INTEGER,
  retries INTEGER DEFAULT 0,
  logs TEXT[] DEFAULT '{}',
  k8s_job_name TEXT
);

-- Test Suites table
CREATE TABLE IF NOT EXISTS test_suites (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  test_definition_ids TEXT[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  variables JSONB DEFAULT '{}'
);

-- Webhooks table
CREATE TABLE IF NOT EXISTS webhooks (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  events TEXT[] NOT NULL,
  headers JSONB DEFAULT '{}',
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_test_runs_status ON test_runs(status);
CREATE INDEX IF NOT EXISTS idx_test_runs_created_at ON test_runs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_test_definitions_created_at ON test_definitions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_test_runs_test_definition_id ON test_runs(test_definition_id);

-- Insert sample data for testing
INSERT INTO test_definitions (id, name, description, image, commands, executor_id, labels) VALUES
('api-tests', 'API Tests', 'Node.js API integration tests', 'node:18-alpine', ARRAY['npm test'], 'jest', ARRAY['api', 'backend']),
('frontend-tests', 'Frontend Tests', 'React component tests', 'node:18-alpine', ARRAY['npm run test:ui'], 'jest', ARRAY['frontend', 'ui']),
('security-scan', 'Security Scan', 'Container security scanning', 'aquasec/trivy', ARRAY['trivy filesystem --security-checks vuln /app'], 'custom', ARRAY['security']),
('e2e-tests', 'E2E Tests', 'End-to-end user journey tests', 'mcr.microsoft.com/playwright:latest', ARRAY['npx playwright test'], 'playwright', ARRAY['e2e', 'integration']),
('performance-tests', 'Performance Tests', 'Load testing with K6', 'grafana/k6:latest', ARRAY['k6 run script.js'], 'k6', ARRAY['performance', 'load']),
('db-migration-tests', 'Database Migration Tests', 'Schema and data integrity tests', 'postgres:15-alpine', ARRAY['psql -f migrations.sql'], 'custom', ARRAY['database', 'migration'])
ON CONFLICT (id) DO NOTHING;

-- Insert sample test runs
INSERT INTO test_runs (id, name, image, command, status, test_definition_id, duration, logs) VALUES
('test-1', 'API Integration Tests', 'node:18-alpine', ARRAY['npm test'], 'completed', 'api-tests', 180, ARRAY['> Starting API tests...', '> Running authentication tests...', '> All tests passed!']),
('test-2', 'Frontend Unit Tests', 'node:18-alpine', ARRAY['npm run test:ui'], 'running', 'frontend-tests', NULL, ARRAY['> Starting frontend tests...', '> Testing components...']),
('test-3', 'Security Scan', 'aquasec/trivy', ARRAY['trivy filesystem --security-checks vuln /app'], 'failed', 'security-scan', 45, ARRAY['> Starting security scan...', '> Found 3 vulnerabilities', '> Scan failed']),
('test-4', 'E2E User Journey', 'mcr.microsoft.com/playwright:latest', ARRAY['npx playwright test'], 'completed', 'e2e-tests', 320, ARRAY['> Starting E2E tests...', '> Testing login flow...', '> Testing checkout process...', '> All scenarios passed!']),
('test-5', 'Load Test - 100 users', 'grafana/k6:latest', ARRAY['k6 run --vus 100 --duration 5m script.js'], 'completed', 'performance-tests', 300, ARRAY['> Starting load test...', '> Ramping up to 100 users...', '> Average response time: 245ms', '> Test completed successfully'])
ON CONFLICT (id) DO NOTHING;

-- Insert sample test suites
INSERT INTO test_suites (id, name, description, test_definition_ids) VALUES
('full-ci', 'Full CI Pipeline', 'Complete testing workflow for CI/CD', ARRAY['api-tests', 'frontend-tests', 'e2e-tests']),
('pre-deploy', 'Pre-Deployment Validation', 'Essential tests before production deployment', ARRAY['api-tests', 'security-scan']),
('security-audit', 'Security Audit Suite', 'Comprehensive security testing', ARRAY['security-scan'])
ON CONFLICT (id) DO NOTHING;

-- Insert sample webhooks
INSERT INTO webhooks (id, name, url, events, headers, enabled) VALUES
('slack-webhook', 'Slack Notifications', 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK', ARRAY['test_completed', 'test_failed'], '{"Content-Type": "application/json"}', true),
('teams-webhook', 'Microsoft Teams', 'https://your-org.webhook.office.com/webhookb2/YOUR-WEBHOOK-URL', ARRAY['test_completed', 'test_failed'], '{"Content-Type": "application/json"}', true),
('discord-webhook', 'Discord Dev Channel', 'https://discord.com/api/webhooks/YOUR/DISCORD/WEBHOOK', ARRAY['test_completed', 'test_failed'], '{"Content-Type": "application/json"}', false)
ON CONFLICT (id) DO NOTHING;
