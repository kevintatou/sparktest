# Working Test Examples

This document describes the working test examples that can actually be executed through the SparkTest Kubernetes backend.

## Overview

The test definitions in migration `0004_working_test_examples.sql` are designed to be self-contained and executable without requiring external files or complex configurations. These examples demonstrate the platform's capabilities with tests that will actually run successfully.

## Test Definitions

### 1. Simple Health Check (`simple-health-check`)
- **Image**: `curlimages/curl:latest`
- **Command**: `curl -f -s -o /dev/null -w "%{http_code}" https://httpbin.org/status/200 && echo "Health check passed"`
- **Purpose**: Tests network connectivity and HTTP response validation
- **Duration**: ~5 seconds
- **Will succeed**: ✅ Uses publicly available API

### 2. Basic Python Test (`basic-python-test`)
- **Image**: `python:3.9-slim`
- **Command**: `python -c "import sys; print(f\"Python version: {sys.version}\"); assert 2 + 2 == 4; print(\"Basic math test passed\")"`
- **Purpose**: Tests Python runtime and basic assertions
- **Duration**: ~3 seconds
- **Will succeed**: ✅ No external dependencies

### 3. Node.js Version Test (`node-version-test`)
- **Image**: `node:18-alpine`
- **Command**: `node -e "console.log(\"Node.js version:\", process.version); console.log(\"Test passed: 2 + 2 =\", 2 + 2); process.exit(0)"`
- **Purpose**: Tests Node.js runtime and basic functionality
- **Duration**: ~2 seconds
- **Will succeed**: ✅ No external dependencies

### 4. Shell Script Test (`shell-script-test`)
- **Image**: `alpine:latest`
- **Command**: `sh -c "echo \"Starting shell test\"; whoami; pwd; ls -la /; echo \"Shell test completed successfully\""`
- **Purpose**: Tests basic shell commands and system information
- **Duration**: ~2 seconds
- **Will succeed**: ✅ Uses standard shell commands

### 5. Network Connectivity Test (`network-connectivity-test`)
- **Image**: `alpine:latest`
- **Command**: `sh -c "apk add --no-cache curl && curl -f -s https://httpbin.org/json && echo \"Network test passed\""`
- **Purpose**: Tests package installation and network connectivity
- **Duration**: ~10 seconds
- **Will succeed**: ✅ Uses publicly available API

### 6. Basic Math Test (`basic-math-test`)
- **Image**: `alpine:latest`
- **Command**: `sh -c "apk add --no-cache bc && echo \"scale=2; 22/7\" | bc && echo \"Math test completed\""`
- **Purpose**: Tests package installation and mathematical computation
- **Duration**: ~8 seconds
- **Will succeed**: ✅ Uses standard math tools

### 7. Date Time Test (`date-time-test`)
- **Image**: `alpine:latest`
- **Command**: `sh -c "date && echo \"Timezone: $(date +%Z)\" && echo \"Epoch: $(date +%s)\" && echo \"Date test passed\""`
- **Purpose**: Tests system date and time functionality
- **Duration**: ~1 second
- **Will succeed**: ✅ Uses standard date commands

### 8. File System Test (`file-system-test`)
- **Image**: `alpine:latest`
- **Command**: `sh -c "mkdir -p /tmp/test && echo \"Hello World\" > /tmp/test/file.txt && cat /tmp/test/file.txt && rm -rf /tmp/test && echo \"File system test passed\""`
- **Purpose**: Tests file system operations and permissions
- **Duration**: ~1 second
- **Will succeed**: ✅ Uses standard file operations

### 9. Environment Test (`environment-test`)
- **Image**: `alpine:latest`
- **Command**: `sh -c "echo \"Hostname: $(hostname)\"; echo \"User: $(whoami)\"; echo \"Home: $HOME\"; echo \"Path: $PATH\"; echo \"Environment test passed\""`
- **Purpose**: Tests environment variables and system information
- **Duration**: ~1 second
- **Will succeed**: ✅ Uses standard environment commands

### 10. JSON Processing Test (`json-processing-test`)
- **Image**: `alpine:latest`
- **Command**: `sh -c "apk add --no-cache jq && echo '{\"name\":\"SparkTest\",\"version\":\"1.0\",\"working\":true}' | jq '.name' && echo \"JSON test passed\""`
- **Purpose**: Tests JSON processing and data manipulation
- **Duration**: ~8 seconds
- **Will succeed**: ✅ Uses standard JSON tools

## Test Suite

### Working Examples Suite (`working-examples-suite`)
- **Execution Mode**: Parallel
- **Labels**: `working`, `examples`, `demo`, `basic`
- **Test Definitions**: All 10 working examples above
- **Total Duration**: ~30-40 seconds (when run in parallel)
- **Purpose**: Demonstrates platform capabilities with guaranteed working tests

## Usage

### Running Individual Tests

To run a specific test through the K8s backend:

```bash
# Create a test run for the health check
curl -X POST http://localhost:3001/api/test-runs \
  -H "Content-Type: application/json" \
  -d '{
    "test_definition_id": "simple-health-check"
  }'
```

### Running the Test Suite

```bash
# Create test runs for all tests in the suite
curl -X POST http://localhost:3001/api/test-runs \
  -H "Content-Type: application/json" \
  -d '{
    "test_definition_id": "working-examples-suite"
  }'
```

### Monitoring Test Progress

```bash
# Get logs for a specific test run
curl http://localhost:3001/api/test-runs/{run_id}/logs

# Get job status
curl http://localhost:3001/api/k8s/jobs/{job_name}/status
```

## Expected Outputs

### Health Check
```
> curl -f -s -o /dev/null -w "%{http_code}" https://httpbin.org/status/200 && echo "Health check passed"
200Health check passed

✅ Test completed successfully
```

### Python Test
```
> python -c "import sys; print(f\"Python version: {sys.version}\"); assert 2 + 2 == 4; print(\"Basic math test passed\")"
Python version: 3.9.18 (main, Jan 24 2024, 22:56:09) [GCC 12.2.0]
Basic math test passed

✅ Test completed successfully
```

### Node.js Test
```
> node -e "console.log(\"Node.js version:\", process.version); console.log(\"Test passed: 2 + 2 =\", 2 + 2); process.exit(0)"
Node.js version: v18.18.2
Test passed: 2 + 2 = 4

✅ Test completed successfully
```

## Benefits

1. **Guaranteed Success**: These tests will run successfully without setup
2. **Fast Execution**: Most tests complete in under 10 seconds
3. **Comprehensive Coverage**: Tests different languages and system capabilities
4. **Self-Contained**: No external files or complex configurations required
5. **Educational Value**: Demonstrates various testing patterns and techniques

## Contrast with Complex Tests

Unlike the complex test definitions that require external files (like `spike-test.yml`, `contract-tests.json`), these working examples:

- ✅ Don't require external test files
- ✅ Use publicly available Docker images
- ✅ Include all necessary commands inline
- ✅ Test real functionality without dependencies
- ✅ Complete successfully when run through K8s backend

This makes them perfect for:
- Demo purposes
- Platform validation
- New user onboarding
- CI/CD pipeline testing
- Development environment validation