import { Definition, Executor, Run, TestSuite } from "@sparktest/core"

// Sample Test Suites
export const sampleTestSuites: TestSuite[] = [
  {
    id: "api-suite",
    name: "API Test Suite",
    description: "Complete API testing including auth, CRUD operations, and error handling",
    testDefinitionIds: ["api-integration-tests", "security-scan", "performance-tests"],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    executionMode: "sequential",
    labels: ["api", "backend"],
  },
  {
    id: "e2e-suite",
    name: "End-to-End Suite",
    description: "Full user journey testing across the application",
    testDefinitionIds: ["e2e-tests", "frontend-unit-tests"],
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    executionMode: "sequential",
    labels: ["e2e", "frontend"],
  },
  {
    id: "performance-suite",
    name: "Performance Test Suite",
    description: "Load testing and performance benchmarks",
    testDefinitionIds: ["performance-tests", "database-migration-tests"],
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    executionMode: "parallel",
    labels: ["performance", "load"],
  },
]

// Sample Definitions
export const sampleDefinitions: Definition[] = [
  {
    id: "api-integration-tests",
    name: "API Integration Tests",
    description: "Comprehensive API testing including authentication, CRUD operations, and error handling",
    image: "node:18-alpine",
    commands: ["npm install", "npm run test:api"],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    executorId: "kubernetes",
    variables: {
      API_URL: "https://api.example.com",
      TEST_ENV: "staging",
    },
    labels: ["api", "integration", "backend"],
  },
]

// Sample Executors
export const sampleExecutors: Executor[] = [
  {
    id: "kubernetes",
    name: "Kubernetes",
    image: "ubuntu:22.04",
    description: "Run tests in Kubernetes cluster",
    command: ["bash", "-c"],
    supportedFileTypes: ["yaml", "yml"],
    env: {
      KUBERNETES_NAMESPACE: "default",
    },
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
]

// Sample Runs
export const sampleRuns: Run[] = [
  {
    id: "run-1",
    name: "API Integration Tests",
    image: "node:18-alpine",
    command: ["npm", "run", "test:api"],
    status: "completed",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    definitionId: "api-integration-tests",
    executorId: "kubernetes",
    duration: 45,
    logs: ["Test completed successfully"],
  },
]