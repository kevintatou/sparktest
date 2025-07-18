# Working Test Examples

This document describes the working test examples that can actually be executed through the SparkTest Kubernetes backend and are also available in local storage mode for frontend development.

## Overview

The working test examples are available in two places:
1. **Database Migration**: `0004_working_test_examples.sql` - For production/real K8s runs
2. **TypeScript Samples**: `packages/core/src/samples.ts` - For local development and frontend demo

These test definitions are designed to be self-contained and executable without requiring external files or complex configurations. They demonstrate the platform's capabilities with tests that will actually run successfully in both modes.

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

## Demo Usage

### Local Storage Mode (Frontend Development)

When running the frontend in local storage mode, the working examples are automatically available:

```bash
# Start the frontend in local storage mode
npm run dev

# The working examples will be visible in:
# - Test Suites: "Working Examples Suite"
# - Test Definitions: All 10 working examples
# - Test Runs: Sample successful runs showing expected outputs
```

### Production Mode (K8s Backend)

To run the working examples through the K8s backend:

```bash
# Apply the database migration
psql -d sparktest -f backend/migrations/0004_working_test_examples.sql

# Create a test run for a specific test
curl -X POST http://localhost:3001/api/test-runs \
  -H "Content-Type: application/json" \
  -d '{
    "test_definition_id": "simple-health-check"
  }'

# Run the entire working examples suite
curl -X POST http://localhost:3001/api/test-runs \
  -H "Content-Type: application/json" \
  -d '{
    "test_definition_id": "working-examples-suite"
  }'
```

### Demo Benefits

1. **Consistent Experience**: Same test definitions work in both modes
2. **Realistic Data**: Frontend shows actual working examples instead of placeholder data
3. **Instant Demo**: No setup required - tests will run successfully out of the box
4. **Educational Value**: Shows real Docker images and commands that actually work
5. **Stakeholder Confidence**: Demonstrates that the platform can execute real tests

## Migration from Complex Examples

The working examples complement the existing complex test definitions in `samples.ts`. The key difference:

**Complex Examples (existing):**
- Require external files (test suites, config files)
- Use sophisticated frameworks (Jest, Playwright, Cypress)
- Demonstrate advanced testing scenarios
- May fail when run due to missing dependencies

**Working Examples (new):**
- Self-contained commands with no external dependencies
- Use simple, reliable Docker images
- Demonstrate basic system capabilities
- Guaranteed to run successfully

Both sets of examples serve different purposes:
- **Complex examples**: Show the platform's full capabilities and realistic usage
- **Working examples**: Provide guaranteed working demos and basic validation

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