-- Add static test definitions for backend Rust mode
-- These are lightweight tests perfect for backend execution

-- Insert static test executor
INSERT INTO test_executors (id, name, description, image, default_command, supported_file_types, environment_variables, icon)
VALUES 
    ('static-executor-backend', 'Static Backend Executor', 'Lightweight executor for simple static tests - ideal for backend Rust mode with minimal dependencies.', 'alpine:latest', 'sh -c', ARRAY['sh', 'txt'], ARRAY['LOG_LEVEL', 'TEST_TYPE'], '🔧');

-- Insert static test definitions
INSERT INTO test_definitions (id, name, description, image, commands, created_at, executor_id)
VALUES 
    ('static-bash-tests', 'Static Bash Tests', 'Simple bash commands and file operations - perfect for backend Rust execution mode', 'alpine:latest', ARRAY['echo ''Test started''', 'ls -la', 'echo ''Environment check''', 'env | grep -E ''^(PATH|HOME|USER)''', 'echo ''Test completed successfully'''], NOW() - INTERVAL '1 day', NULL),
    ('static-curl-tests', 'Static HTTP Tests', 'Basic HTTP endpoint testing using curl - minimal dependencies for backend execution', 'alpine/curl:latest', ARRAY['curl -I https://httpbin.org/status/200', 'curl -s https://httpbin.org/json', 'curl -X POST -d ''{"test":"data"}'' https://httpbin.org/post'], NOW() - INTERVAL '2 days', NULL),
    ('static-file-tests', 'Static File Operations', 'File system operations and data validation - great for backend processing tests', 'alpine:latest', ARRAY['touch /tmp/test.txt', 'echo ''Hello World'' > /tmp/test.txt', 'cat /tmp/test.txt', 'wc -l /tmp/test.txt', 'rm /tmp/test.txt'], NOW() - INTERVAL '3 days', NULL),
    ('static-json-tests', 'Static JSON Processing', 'JSON data processing and validation using jq - lightweight for backend mode', 'alpine/jq:latest', ARRAY['echo ''{"name":"test","value":123}'' | jq .', 'echo ''[1,2,3,4,5]'' | jq ''length''', 'echo ''{"items":[{"id":1},{"id":2}]}'' | jq ''.items | length'''], NOW() - INTERVAL '4 days', NULL),
    ('static-network-tests', 'Static Network Tests', 'Basic network connectivity and DNS resolution - simple backend networking tests', 'alpine:latest', ARRAY['ping -c 3 8.8.8.8', 'nslookup google.com', 'wget -O /dev/null -q https://example.com', 'echo ''Network tests completed'''], NOW() - INTERVAL '5 days', NULL);

-- Insert static test suite
INSERT INTO test_suites (id, name, description, execution_mode, labels, test_definition_ids, created_at)
VALUES 
    ('static-backend-suite', 'Static Backend Test Suite', 'Simple static tests perfect for backend Rust mode - lightweight and dependency-free', 'sequential', ARRAY['static', 'backend', 'simple'], ARRAY['static-bash-tests', 'static-curl-tests', 'static-file-tests', 'static-json-tests']::UUID[], NOW() - INTERVAL '6 days');

-- Insert sample test runs for static tests
INSERT INTO test_runs (id, name, image, command, status, created_at, duration, logs, test_definition_id, executor_id)
VALUES 
    ('static-bash-run-1', 'Static Bash Tests - Backend Mode', 'alpine:latest', ARRAY['echo ''Test started''', 'ls -la', 'echo ''Environment check''', 'env | grep -E ''^(PATH|HOME|USER)''', 'echo ''Test completed successfully'''], 'completed', NOW() - INTERVAL '1 day', 45, ARRAY['> Test started', '> total 12', '> drwxr-xr-x 1 root root 4096 Jul 12 10:30 .', '> drwxr-xr-x 1 root root 4096 Jul 12 10:30 ..', '> Environment check', '> PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin', '> HOME=/root', '> USER=root', '> Test completed successfully'], 'static-bash-tests', NULL),
    ('static-curl-run-1', 'Static HTTP Tests - Basic API', 'alpine/curl:latest', ARRAY['curl -I https://httpbin.org/status/200', 'curl -s https://httpbin.org/json'], 'completed', NOW() - INTERVAL '2 days', 12, ARRAY['> HTTP/1.1 200 OK', '> Content-Type: application/json', '> Date: Sat, 12 Jul 2025 10:30:45 GMT', '> {', '>   "slideshow": {', '>     "author": "Yours Truly",', '>     "date": "date of publication",', '>     "title": "Sample Slide Show"', '>   }', '> }'], 'static-curl-tests', NULL),
    ('static-file-run-1', 'Static File Operations - Backend Test', 'alpine:latest', ARRAY['touch /tmp/test.txt', 'echo ''Hello World'' > /tmp/test.txt', 'cat /tmp/test.txt', 'wc -l /tmp/test.txt'], 'completed', NOW() - INTERVAL '3 days', 8, ARRAY['> Creating test file...', '> Writing data to file...', '> Hello World', '> 1 /tmp/test.txt', '> File operations completed successfully'], 'static-file-tests', NULL),
    ('static-json-run-1', 'Static JSON Processing - Data Validation', 'alpine/jq:latest', ARRAY['echo ''{"name":"test","value":123}'' | jq .'], 'completed', NOW() - INTERVAL '4 days', 3, ARRAY['> Processing JSON data...', '> {', '>   "name": "test",', '>   "value": 123', '> }', '> JSON validation completed'], 'static-json-tests', NULL);