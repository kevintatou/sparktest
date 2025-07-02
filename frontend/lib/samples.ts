import { Definition, Executor, Run, TestSuite } from "./types"

// Sample Definitions
export const sampleDefinitions: Definition[] = [
  {
    id: "api-integration-tests",
    name: "API Integration Tests",
    description: "Comprehensive API testing including authentication, CRUD operations, and error handling",
    image: "node:18-alpine",
    commands: ["npm install", "npm run test:api"],
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    executorId: "kubernetes",
    variables: {
      API_URL: "https://api.example.com",
      TEST_ENV: "staging",
    },
    labels: ["api", "integration", "backend"],
  },
  {
    id: "frontend-unit-tests",
    name: "Frontend Unit Tests",
    description: "React component testing with Jest and React Testing Library",
    image: "node:18-alpine",
    commands: ["npm install", "npm run test:unit", "npm run test:coverage"],
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    executorId: "docker",
    variables: {
      NODE_ENV: "test",
      CI: "true",
    },
    labels: ["frontend", "unit", "react"],
  },
  {
    id: "e2e-tests",
    name: "End-to-End Tests",
    description: "Full user journey testing with Playwright",
    image: "mcr.microsoft.com/playwright:v1.40.0-focal",
    commands: ["npm install", "npx playwright install", "npm run test:e2e"],
    createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    executorId: "kubernetes",
    variables: {
      BASE_URL: "https://staging.example.com",
      HEADLESS: "true",
    },
    labels: ["e2e", "playwright", "integration"],
  },
  {
    id: "security-scan",
    name: "Security Vulnerability Scan",
    description: "OWASP ZAP security scanning and dependency audit",
    image: "owasp/zap2docker-stable",
    commands: ["zap-baseline.py", "-t", "$TARGET_URL", "-r", "security-report.html"],
    createdAt: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
    executorId: "docker",
    variables: {
      TARGET_URL: "https://staging.example.com",
    },
    labels: ["security", "owasp", "scan"],
  },
  {
    id: "performance-tests",
    name: "Performance Load Tests",
    description: "Load testing with K6 to ensure application performance under stress",
    image: "grafana/k6:latest",
    commands: ["k6", "run", "--vus", "50", "--duration", "5m", "performance-test.js"],
    createdAt: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
    executorId: "kubernetes",
    variables: {
      BASE_URL: "https://api.example.com",
      VUS: "50",
      DURATION: "5m",
    },
    labels: ["performance", "load", "k6"],
  },
  {
    id: "database-migration-tests",
    name: "Database Migration Tests",
    description: "Test database schema migrations and data integrity",
    image: "postgres:15-alpine",
    commands: ["./scripts/test-migrations.sh", "npm run migrate:test"],
    createdAt: new Date(Date.now() - 518400000).toISOString(), // 6 days ago
    executorId: "docker",
    variables: {
      DATABASE_URL: "postgresql://test:test@localhost:5432/testdb",
      MIGRATION_PATH: "./migrations",
    },
    labels: ["database", "migration", "postgres"],
  },
  {
    id: "github-demo-1",
    name: "GitHub PR Smoke Test",
    description: "Runs smoke tests on every pull request using a definition synced from GitHub.",
    image: "node:18-alpine",
    commands: ["npm ci", "npm run test:smoke"],
    createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    executorId: "kubernetes",
    variables: {
      GITHUB_REPO: "github.com/example/repo",
      PR_NUMBER: "123",
    },
    labels: ["github", "smoke", "pr"],
  },
  {
    id: "github-demo-2",
    name: "GitHub Nightly E2E",
    description: "Nightly end-to-end tests auto-registered from a GitHub repo.",
    image: "mcr.microsoft.com/playwright:v1.40.0-focal",
    commands: ["npm ci", "npx playwright install", "npm run test:e2e"],
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    executorId: "kubernetes",
    variables: {
      GITHUB_REPO: "github.com/example/repo",
      SCHEDULE: "nightly",
    },
    labels: ["github", "e2e", "nightly"],
  },
]

// Sample Runs
export const sampleRuns: Run[] = [
  {
    id: "run-1",
    name: "API Integration Tests - Production Deploy",
    image: "node:18-alpine",
    command: ["npm install", "npm run test:api"],
    status: "completed",
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    definitionId: "api-integration-tests",
    executorId: "kubernetes",
    variables: {
      API_URL: "https://api.example.com",
      TEST_ENV: "production",
    },
    artifacts: ["test-results.xml", "coverage-report.html"],
    duration: 245000, // 4 minutes 5 seconds
    logs: [
      "> Starting API integration tests...",
      "> Installing dependencies...",
      "npm install completed in 45s",
      "> Running test suite...",
      "✓ Authentication tests (15 passed)",
      "✓ User management tests (8 passed)",
      "✓ Product API tests (12 passed)",
      "✓ Order processing tests (6 passed)",
      "> All tests passed! 41/41",
      "> Generating coverage report...",
      "> Test completed successfully",
    ],
  },
  {
    id: "run-2",
    name: "Frontend Unit Tests - Feature Branch",
    image: "node:18-alpine",
    command: ["npm install", "npm run test:unit"],
    status: "running",
    createdAt: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
    definitionId: "frontend-unit-tests",
    executorId: "docker",
    variables: {
      NODE_ENV: "test",
      CI: "true",
    },
    artifacts: [],
    logs: [
      "> Starting frontend unit tests...",
      "> Installing dependencies...",
      "npm install completed in 32s",
      "> Running Jest test suite...",
      "✓ Component tests (24 passed)",
      "> Currently running hook tests...",
    ],
  },
  {
    id: "run-3",
    name: "Security Scan - Weekly Check",
    image: "owasp/zap2docker-stable",
    command: ["zap-baseline.py", "-t", "https://staging.example.com"],
    status: "failed",
    createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    definitionId: "security-scan",
    executorId: "docker",
    variables: {
      TARGET_URL: "https://staging.example.com",
    },
    artifacts: ["security-report.html", "zap-session.data"],
    duration: 180000, // 3 minutes
    logs: [
      "> Starting OWASP ZAP security scan...",
      "> Target: https://staging.example.com",
      "> Running baseline scan...",
      "⚠ Medium risk vulnerability found: X-Frame-Options header missing",
      "⚠ Low risk vulnerability found: X-Content-Type-Options header missing",
      "❌ High risk vulnerability found: SQL injection possible",
      "> Scan completed with 1 high, 1 medium, 1 low risk findings",
      "> Security scan failed - high risk vulnerabilities detected",
    ],
  },
  {
    id: "run-4",
    name: "E2E Tests - Staging Validation",
    image: "mcr.microsoft.com/playwright:v1.40.0-focal",
    command: ["npm install", "npx playwright install", "npm run test:e2e"],
    status: "completed",
    createdAt: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
    definitionId: "e2e-tests",
    executorId: "kubernetes",
    variables: {
      BASE_URL: "https://staging.example.com",
      HEADLESS: "true",
    },
    artifacts: ["playwright-report.html", "test-results.json"],
    duration: 420000, // 7 minutes
    logs: [
      "> Starting end-to-end tests...",
      "> Installing Playwright browsers...",
      "> Running test scenarios...",
      "✓ User login flow (3 tests passed)",
      "✓ Product browsing (5 tests passed)",
      "✓ Shopping cart (4 tests passed)",
      "✓ Checkout process (6 tests passed)",
      "> All E2E tests passed! 18/18",
      "> Test completed successfully",
    ],
  },
  {
    id: "run-5",
    name: "Performance Tests - Load Testing",
    image: "grafana/k6:latest",
    command: ["k6", "run", "--vus", "50", "--duration", "5m", "performance-test.js"],
    status: "completed",
    createdAt: new Date(Date.now() - 14400000).toISOString(), // 4 hours ago
    definitionId: "performance-tests",
    executorId: "kubernetes",
    variables: {
      BASE_URL: "https://api.example.com",
      VUS: "50",
      DURATION: "5m",
    },
    artifacts: ["performance-report.json", "metrics.csv"],
    duration: 300000, // 5 minutes
    logs: [
      "> Starting K6 performance tests...",
      "> Ramping up to 50 virtual users...",
      "> Running load test for 5 minutes...",
      "✓ http_req_duration: avg=245ms p95=890ms",
      "✓ http_req_rate: 1247 requests/second",
      "✓ http_req_failed: 0.02% error rate",
      "> Performance targets met",
      "> Load test completed successfully",
    ],
  },
]

// Sample Executors
export const sampleExecutors: Executor[] = [
  {
    id: "kubernetes",
    name: "Kubernetes Job",
    image: "k8s-job-runner:latest",
    description: "Run tests as Kubernetes Jobs with full isolation and cluster context.",
    command: ["npm", "run", "test"],
    supportedFileTypes: ["js", "json", "yaml"],
    env: {
      NODE_ENV: "test",
    },
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  },
  {
    id: "docker",
    name: "Docker Container",
    image: "docker-runner:stable",
    description: "Execute your test inside a Docker container locally or remotely.",
    command: ["run-tests.sh"],
    supportedFileTypes: ["sh", "py"],
    env: {},
    createdAt: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
  },
]

// Sample Test Suites
export const sampleTestSuites: TestSuite[] = [
  {
    id: "api-test-suite",
    name: "API Test Suite",
    description: "Complete API testing including auth, CRUD operations, and error handling",
    testDefinitionIds: ["api-integration-tests", "security-scan"],
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    executionMode: "sequential",
    labels: ["api", "backend"],
  },
  {
    id: "frontend-test-suite",
    name: "Frontend Test Suite",
    description: "Comprehensive frontend testing including unit tests and E2E tests",
    testDefinitionIds: ["frontend-unit-tests", "e2e-tests"],
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    executionMode: "parallel",
    labels: ["frontend", "ui"],
  },
  {
    id: "full-stack-test-suite",
    name: "Full Stack Test Suite",
    description: "Complete application testing including frontend, backend, and performance tests",
    testDefinitionIds: ["api-integration-tests", "frontend-unit-tests", "e2e-tests", "performance-tests"],
    createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    executionMode: "sequential",
    labels: ["full-stack", "release"],
  },
]
