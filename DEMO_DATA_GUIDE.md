# Demo Data Guide for SparkTest

This guide covers the comprehensive demo data implementation for SparkTest, including both realistic examples and working test scenarios.

## Overview

SparkTest includes two types of demo data:

1. **Realistic Demo Data**: Comprehensive test scenarios showcasing industry-standard testing frameworks and real-world use cases
2. **Working Test Examples**: Self-contained tests that actually execute successfully through the Kubernetes backend

## Realistic Demo Data Implementation

### New Test Executors

The SparkTest application now includes comprehensive real-world test data including:

- **Popular Test Executors**: Jest, Cypress, Playwright, K6, Pytest, Postman, and more
- **Realistic Test Definitions**: Component tests, API tests, E2E tests, load tests, security scans
- **Detailed Test Runs**: Complete logs and outputs from actual test scenarios
- **Production-Ready Test Suites**: Organized collections of tests for different purposes

#### Frontend Testing

- **Jest Test Runner**: JavaScript/TypeScript unit tests with coverage reporting
- **Cypress E2E Runner**: Cross-browser end-to-end testing with visual regression
- **Playwright Test Runner**: Modern E2E testing with multi-browser support
- **TestCafe Runner**: No-WebDriver E2E testing

#### Backend Testing

- **K6 Load Test Runner**: Performance and load testing with JavaScript
- **Pytest Runner**: Python unit and integration tests with Django/Flask support
- **Postman Collection Runner**: API testing with Newman CLI
- **GitHub Actions Runner**: CI/CD pipeline testing environment

#### Infrastructure Testing

- **Docker Container Runner**: Isolated container testing with custom configurations
- **Kubernetes Test Runner**: Container orchestration and deployment testing
- **OWASP Security Scanner**: Vulnerability detection and penetration testing
- **Selenium Grid Runner**: Cross-browser testing with multiple environments

### Real-World Test Scenarios

#### React Component Unit Tests

```typescript
{
  name: "React Component Unit Tests - PR #247",
  status: "completed",
  duration: 145000, // 2 minutes 25 seconds
  coverage: "94.2% (1847/1960 statements)",
  artifacts: ["coverage-report.html", "test-results.json"]
}
```

#### K6 Load Test with Performance Metrics

```typescript
{
  name: "K6 Performance Load Tests - API Stress Test",
  status: "failed",
  metrics: {
    http_req_duration: "avg=1.89s, p95=4.8s",
    http_req_failed: "8.00% (above 0.1% threshold)",
    error_rate: "7.7% during peak load"
  }
}
```

#### OWASP Security Scan with Vulnerability Details

```typescript
{
  name: "OWASP Security Vulnerability Scan",
  status: "failed",
  findings: {
    high: "2 (SQL Injection, XSS)",
    medium: "3 (X-Frame-Options missing)",
    low: "5 (X-Content-Type-Options missing)"
  }
}
```

## Working Test Examples

These test examples are designed to actually execute through the SparkTest Kubernetes backend and are also available in local storage mode for frontend development.

### Availability

- **Database Migration**: `backend/migrations/0004_working_test_examples.sql` - For production/real K8s runs
- **TypeScript Samples**: `packages/core/src/samples.ts` - For local development and frontend demo

### Test Definitions

#### 1. Simple Health Check (`simple-health-check`)

- **Image**: `curlimages/curl:latest`
- **Command**: `curl -f -s -o /dev/null -w "%{http_code}" https://httpbin.org/status/200 && echo "Health check passed"`
- **Purpose**: Tests network connectivity and HTTP response validation
- **Duration**: ~5 seconds
- **Will succeed**: ✅ Uses publicly available API

#### 2. Python Test (`python-test`)

- **Image**: `python:3.9-slim`
- **Command**: `python -c "print('Python test passed'); import sys; sys.exit(0)"`
- **Purpose**: Tests Python runtime and basic script execution
- **Duration**: ~3 seconds
- **Will succeed**: ✅ Self-contained Python script

#### 3. Node.js Test (`nodejs-test`)

- **Image**: `node:18-alpine`
- **Command**: `node -e "console.log('Node.js test passed'); process.exit(0)"`
- **Purpose**: Tests Node.js runtime and JavaScript execution
- **Duration**: ~2 seconds
- **Will succeed**: ✅ Self-contained Node.js script

#### 4. Shell Script Test (`shell-test`)

- **Image**: `alpine:latest`
- **Command**: `sh -c "echo 'Shell test started'; sleep 2; echo 'Shell test completed successfully'; exit 0"`
- **Purpose**: Tests shell script execution and command chaining
- **Duration**: ~3 seconds
- **Will succeed**: ✅ Basic shell commands

#### 5. API Test (`api-test`)

- **Image**: `curlimages/curl:latest`
- **Command**: `curl -X GET https://jsonplaceholder.typicode.com/posts/1 && echo "API test passed"`
- **Purpose**: Tests HTTP API calls and JSON response handling
- **Duration**: ~4 seconds
- **Will succeed**: ✅ Uses public JSONPlaceholder API

#### 6. File Operations Test (`file-ops-test`)

- **Image**: `alpine:latest`
- **Command**: `sh -c "echo 'test content' > /tmp/test.txt && cat /tmp/test.txt && echo 'File operations test passed'"`
- **Purpose**: Tests file system operations and I/O
- **Duration**: ~2 seconds
- **Will succeed**: ✅ Simple file operations

#### 7. Environment Test (`env-test`)

- **Image**: `alpine:latest`
- **Command**: `sh -c "echo 'Container: '$(hostname) && echo 'User: '$(whoami) && echo 'Environment test passed'"`
- **Purpose**: Tests environment variables and system information
- **Duration**: ~2 seconds
- **Will succeed**: ✅ Basic system commands

#### 8. Math Test (`math-test`)

- **Image**: `python:3.9-slim`
- **Command**: `python -c "result = 2 + 2; print(f'Math test: 2 + 2 = {result}'); print('Math test passed')"`
- **Purpose**: Tests computational operations and output formatting
- **Duration**: ~3 seconds
- **Will succeed**: ✅ Simple mathematical operations

#### 9. JSON Test (`json-test`)

- **Image**: `alpine:latest`
- **Command**: `sh -c "echo '{\"test\": true, \"status\": \"passed\"}' | grep -o '\"test\"' && echo 'JSON test passed'"`
- **Purpose**: Tests JSON parsing and text processing
- **Duration**: ~2 seconds
- **Will succeed**: ✅ Basic JSON handling

#### 10. Multi-Step Test (`multi-step-test`)

- **Image**: `alpine:latest`
- **Command**: `sh -c "echo 'Step 1: Initialize'; sleep 1; echo 'Step 2: Process'; sleep 1; echo 'Step 3: Complete'; echo 'Multi-step test passed'"`
- **Purpose**: Tests multi-step workflows and timing
- **Duration**: ~4 seconds
- **Will succeed**: ✅ Sequential command execution

## Usage Instructions

### Local Development (Mock Mode)

1. Start the frontend: `cd frontend && pnpm dev`
2. Visit `http://localhost:3000`
3. Working examples are available in the demo data

### Production Mode (K8s Backend)

1. Set up environment variables in `.env`
2. Run database migrations: `psql -d sparktest -f backend/migrations/0004_working_test_examples.sql`
3. Start the backend: `cd backend && cargo run`
4. Start the frontend: `cd frontend && pnpm dev`
5. Create test runs from the working examples

### Running Database Migrations

To apply the working test examples to your database:

```bash
# Make sure your database is running
psql -d sparktest -f backend/migrations/0004_working_test_examples.sql
```

## Migration Files

All migration files are located in `backend/migrations/`:

- `0001_initial_schema_and_data.sql` - Initial database schema and sample data
- `0002_add_source_field.sql` - Add source field for GitHub integration
- `0003_production_ready_data.sql` - Comprehensive realistic test data
- `0004_working_test_examples.sql` - Working test examples that actually run

## Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

- `DATABASE_URL`: PostgreSQL connection string
- `KUBERNETES_NAMESPACE`: K8s namespace for test jobs
- `GITHUB_TOKEN`: Optional for GitHub integration

### Kubernetes Setup

Ensure your cluster has:

- Service accounts with appropriate permissions
- Network policies allowing outbound HTTP/HTTPS
- Resource limits configured for test jobs

## Benefits

1. **Realistic Demonstrations**: Showcase actual testing scenarios instead of placeholder data
2. **Better Development Experience**: Meaningful test data for local development
3. **Production Readiness**: Comprehensive configuration templates and examples
4. **Educational Value**: Learn from real test scenarios and industry best practices
5. **Stakeholder Engagement**: Demonstrate platform capabilities with authentic data

## Technical Details

- **Backward Compatibility**: All existing functionality preserved
- **Test Coverage**: All tests continue to pass
- **Mode Support**: Works in both mock mode (localStorage) and production mode (PostgreSQL)
- **Flexible Configuration**: Environment-based switching between modes

This implementation transforms SparkTest from having generic placeholder data to showcasing real-world testing scenarios that demonstrate the platform's capabilities with authentic, production-ready examples.
