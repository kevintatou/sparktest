-- Working test examples that can actually run through the K8s backend
-- These tests don't require external files and will execute successfully

-- Insert simple, self-contained test definitions that will actually work
INSERT INTO test_definitions (id, name, description, image, commands, created_at, executor_id)
VALUES 
    -- Basic system tests that will work out of the box
    ('simple-health-check', 'Simple Health Check', 'Basic system health check using curl to test network connectivity', 'curlimages/curl:latest', ARRAY['curl -f -s -o /dev/null -w "%{http_code}" https://httpbin.org/status/200 && echo "Health check passed"'], '2025-07-20 12:00:00+00', null),
    
    ('basic-python-test', 'Basic Python Test', 'Simple Python test that runs without external dependencies', 'python:3.9-slim', ARRAY['python -c "import sys; print(f\"Python version: {sys.version}\"); assert 2 + 2 == 4; print(\"Basic math test passed\")"'], '2025-07-20 12:00:00+00', null),
    
    ('node-version-test', 'Node.js Version Test', 'Test Node.js installation and basic functionality', 'node:18-alpine', ARRAY['node -e "console.log(\"Node.js version:\", process.version); console.log(\"Test passed: 2 + 2 =\", 2 + 2); process.exit(0)"'], '2025-07-20 12:00:00+00', null),
    
    ('shell-script-test', 'Shell Script Test', 'Basic shell script test with system commands', 'alpine:latest', ARRAY['sh -c "echo \"Starting shell test\"; whoami; pwd; ls -la /; echo \"Shell test completed successfully\""'], '2025-07-20 12:00:00+00', null),
    
    ('network-connectivity-test', 'Network Connectivity Test', 'Test network connectivity to external services', 'alpine:latest', ARRAY['sh -c "apk add --no-cache curl && curl -f -s https://httpbin.org/json && echo \"Network test passed\""'], '2025-07-20 12:00:00+00', null),
    
    ('basic-math-test', 'Basic Math Test', 'Simple mathematical computation test using bc', 'alpine:latest', ARRAY['sh -c "apk add --no-cache bc && echo \"scale=2; 22/7\" | bc && echo \"Math test completed\""'], '2025-07-20 12:00:00+00', null),
    
    ('date-time-test', 'Date Time Test', 'Test system date and time functionality', 'alpine:latest', ARRAY['sh -c "date && echo \"Timezone: $(date +%Z)\" && echo \"Epoch: $(date +%s)\" && echo \"Date test passed\""'], '2025-07-20 12:00:00+00', null),
    
    ('file-system-test', 'File System Test', 'Test file system operations and permissions', 'alpine:latest', ARRAY['sh -c "mkdir -p /tmp/test && echo \"Hello World\" > /tmp/test/file.txt && cat /tmp/test/file.txt && rm -rf /tmp/test && echo \"File system test passed\""'], '2025-07-20 12:00:00+00', null),
    
    ('environment-test', 'Environment Test', 'Test environment variables and system information', 'alpine:latest', ARRAY['sh -c "echo \"Hostname: $(hostname)\"; echo \"User: $(whoami)\"; echo \"Home: $HOME\"; echo \"Path: $PATH\"; echo \"Environment test passed\""'], '2025-07-20 12:00:00+00', null),
    
    ('json-processing-test', 'JSON Processing Test', 'Test JSON processing using jq', 'alpine:latest', ARRAY['sh -c "apk add --no-cache jq && echo '{\"name\":\"SparkTest\",\"version\":\"1.0\",\"working\":true}' | jq '.name' && echo \"JSON test passed\""'], '2025-07-20 12:00:00+00', null)
ON CONFLICT (id) DO NOTHING;

-- Insert a test suite for the working examples
INSERT INTO test_suites (id, name, description, execution_mode, labels, test_definition_ids, created_at)
VALUES 
    ('working-examples-suite', 'Working Examples Suite', 'Collection of simple, self-contained tests that demonstrate the platform capabilities', 'parallel', ARRAY['working', 'examples', 'demo', 'basic'], ARRAY[
        'simple-health-check',
        'basic-python-test',
        'node-version-test',
        'shell-script-test',
        'network-connectivity-test',
        'basic-math-test',
        'date-time-test',
        'file-system-test',
        'environment-test',
        'json-processing-test'
    ]::UUID[], '2025-07-20 12:00:00+00')
ON CONFLICT (id) DO NOTHING;

-- Insert some sample test runs that show successful execution
INSERT INTO test_runs (id, name, image, command, status, created_at, duration, logs, test_definition_id, executor_id)
VALUES 
    ('working-health-check-run', 'Health Check - Working Example', 'curlimages/curl:latest', ARRAY['curl -f -s -o /dev/null -w "%{http_code}" https://httpbin.org/status/200 && echo "Health check passed"'], 'completed', '2025-07-20 08:00:00+00', 5000, ARRAY[
        '> curl -f -s -o /dev/null -w "%{http_code}" https://httpbin.org/status/200 && echo "Health check passed"',
        '200Health check passed',
        '',
        '✅ Test completed successfully'
    ], 'simple-health-check', null),
    
    ('working-python-test-run', 'Python Test - Working Example', 'python:3.9-slim', ARRAY['python -c "import sys; print(f\"Python version: {sys.version}\"); assert 2 + 2 == 4; print(\"Basic math test passed\")"'], 'completed', '2025-07-20 08:05:00+00', 3000, ARRAY[
        '> python -c "import sys; print(f\"Python version: {sys.version}\"); assert 2 + 2 == 4; print(\"Basic math test passed\")"',
        'Python version: 3.9.18 (main, Jan 24 2024, 22:56:09) [GCC 12.2.0]',
        'Basic math test passed',
        '',
        '✅ Test completed successfully'
    ], 'basic-python-test', null),
    
    ('working-node-test-run', 'Node.js Test - Working Example', 'node:18-alpine', ARRAY['node -e "console.log(\"Node.js version:\", process.version); console.log(\"Test passed: 2 + 2 =\", 2 + 2); process.exit(0)"'], 'completed', '2025-07-20 08:10:00+00', 2000, ARRAY[
        '> node -e "console.log(\"Node.js version:\", process.version); console.log(\"Test passed: 2 + 2 =\", 2 + 2); process.exit(0)"',
        'Node.js version: v18.18.2',
        'Test passed: 2 + 2 = 4',
        '',
        '✅ Test completed successfully'
    ], 'node-version-test', null)
ON CONFLICT (id) DO NOTHING;
