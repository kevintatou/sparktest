import type { Test } from "./types"

const mockTests: Test[] = [
  {
    id: "test-1",
    name: "API Integration Tests",
    image: "node:18-alpine",
    command: ["npm", "test"],
    status: "completed",
    createdAt: "2023-05-20T14:30:00Z",
    testDefinitionId: "api-tests",
  },
  {
    id: "test-2",
    name: "Frontend Unit Tests",
    image: "node:18-alpine",
    command: ["npm", "run", "test:unit"],
    status: "running",
    createdAt: "2023-05-20T15:45:00Z",
    testDefinitionId: "frontend-tests",
  },
  {
    id: "test-3",
    name: "Database Migration Tests",
    image: "postgres:14-alpine",
    command: ["./scripts/test-migrations.sh"],
    status: "failed",
    createdAt: "2023-05-20T13:15:00Z",
    testDefinitionId: "database-migration-tests",
  },
  {
    id: "test-4",
    name: "Security Scan",
    image: "aquasec/trivy",
    command: ["trivy", "filesystem", "--security-checks", "vuln", "/app"],
    status: "completed",
    createdAt: "2023-05-19T11:30:00Z",
    testDefinitionId: "security-scan",
  },
  {
    id: "test-5",
    name: "Performance Tests",
    image: "k6io/k6",
    command: ["run", "/scripts/performance.js"],
    status: "running",
    createdAt: "2023-05-20T16:00:00Z",
    testDefinitionId: "performance-tests",
  },
]

export function getMockTests(): Test[] {
  return [...mockTests]
}

export function getMockTestById(id: string): Test | undefined {
  return mockTests.find((test) => test.id === id)
}

// Add a function to get test definitions
export function getMockTestDefinitions() {
  return [
    {
      id: "api-tests",
      name: "API Tests",
      description: "Node.js API integration tests",
      image: "node:18-alpine",
      commands: ["npm test"],
    },
    {
      id: "frontend-tests",
      name: "Frontend Tests",
      description: "React component tests",
      image: "node:18-alpine",
      commands: ["npm run test:ui"],
    },
    {
      id: "security-scan",
      name: "Security Scan",
      description: "Container security scanning",
      image: "aquasec/trivy",
      commands: ["trivy filesystem --security-checks vuln /app"],
    },
    {
      id: "performance-tests",
      name: "Performance Tests",
      description: "Load testing with k6",
      image: "k6io/k6",
      commands: ["run /scripts/performance.js"],
    },
    {
      id: "database-migration-tests",
      name: "Database Migration Tests",
      description: "Test database migrations",
      image: "postgres:14-alpine",
      commands: ["./scripts/test-migrations.sh"],
    },
  ]
}

export function getMockTestDefinitionById(id: string) {
  return getMockTestDefinitions().find((def) => def.id === id)
}
