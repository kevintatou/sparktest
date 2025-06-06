import type { TestDefinition, Test } from "./types"

// Sample test data
const sampleTestDefinitions: TestDefinition[] = [
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
]

const sampleTestRuns: Test[] = [
  {
    id: "run-1",
    name: "API Integration Tests - Production Deploy",
    image: "node:18-alpine",
    command: ["npm install", "npm run test:api"],
    status: "completed",
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    testDefinitionId: "api-integration-tests",
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
    testDefinitionId: "frontend-unit-tests",
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
    testDefinitionId: "security-scan",
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
    testDefinitionId: "e2e-tests",
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
    testDefinitionId: "performance-tests",
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

// Simple localStorage-based storage service
function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch {
    return defaultValue
  }
}

function setToStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error("Failed to save to localStorage:", error)
  }
}

// Test Definitions
export function getTestDefinitions(): TestDefinition[] {
  return getFromStorage("sparktest_test_definitions", sampleTestDefinitions)
}

export function saveTestDefinition(testDefinition: TestDefinition): TestDefinition {
  const definitions = getTestDefinitions()
  const existingIndex = definitions.findIndex((d) => d.id === testDefinition.id)

  if (existingIndex >= 0) {
    definitions[existingIndex] = testDefinition
  } else {
    definitions.push(testDefinition)
  }

  setToStorage("sparktest_test_definitions", definitions)
  return testDefinition
}

export function deleteTestDefinition(id: string): boolean {
  const definitions = getTestDefinitions()
  const filtered = definitions.filter((d) => d.id !== id)
  setToStorage("sparktest_test_definitions", filtered)
  return true
}

export function getTestDefinitionById(id: string): TestDefinition | undefined {
  return getTestDefinitions().find((d) => d.id === id)
}

// Test Runs
export function getTestRuns(): Test[] {
  return getFromStorage("sparktest_test_runs", sampleTestRuns)
}

export function saveTestRun(testRun: Test): Test {
  const runs = getTestRuns()
  const existingIndex = runs.findIndex((r) => r.id === testRun.id)

  if (existingIndex >= 0) {
    runs[existingIndex] = testRun
  } else {
    runs.unshift(testRun) // Add to beginning for newest first
  }

  // Keep only the most recent 50 runs
  const recentRuns = runs.slice(0, 50)
  setToStorage("sparktest_test_runs", recentRuns)
  return testRun
}

export function deleteTestRun(id: string): boolean {
  const runs = getTestRuns()
  const filtered = runs.filter((r) => r.id !== id)
  setToStorage("sparktest_test_runs", filtered)
  return true
}

export function getTestRunById(id: string): Test | undefined {
  return getTestRuns().find((r) => r.id === id)
}

export function createTestRun(
  testDefinitionId: string,
  options?: { name?: string; image?: string; commands?: string[] },
): Test {
  const testDef = getTestDefinitionById(testDefinitionId)
  if (!testDef) {
    throw new Error("Test definition not found")
  }

  const testRun: Test = {
    id: `test-${Date.now()}`,
    name: options?.name || `${testDef.name} Run`,
    image: options?.image || testDef.image,
    command: options?.commands || testDef.commands,
    status: "running",
    createdAt: new Date().toISOString(),
    testDefinitionId: testDef.id,
    executorId: testDef.executorId,
    variables: testDef.variables || {},
    artifacts: [],
    logs: [`> Starting test run: ${options?.name || testDef.name}`, "> Initializing..."],
  }

  return saveTestRun(testRun)
}

export function initializeStorage(): void {
  // Initialize with sample data if empty
  if (typeof window !== "undefined") {
    const existingDefs = localStorage.getItem("sparktest_test_definitions")
    const existingRuns = localStorage.getItem("sparktest_test_runs")

    if (!existingDefs) {
      setToStorage("sparktest_test_definitions", sampleTestDefinitions)
    }

    if (!existingRuns) {
      setToStorage("sparktest_test_runs", sampleTestRuns)
    }
  }
}

// Export as object for compatibility
export const storageService = {
  getTestDefinitions,
  saveTestDefinition,
  deleteTestDefinition,
  getTestDefinitionById,
  getTestRuns,
  saveTestRun,
  deleteTestRun,
  getTestRunById,
  createTestRun,
  initializeStorage,
}
