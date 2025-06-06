export interface TestExecutor {
  id: string
  name: string
  description: string
  image: string
  defaultCommand: string[]
  supportedFileTypes: string[]
  environmentVariables?: Record<string, string>
  icon: string
}

export const TEST_EXECUTORS: TestExecutor[] = [
  {
    id: "postman",
    name: "Postman/Newman",
    description: "Run Postman collections using Newman",
    image: "postman/newman:latest",
    defaultCommand: ["newman", "run"],
    supportedFileTypes: [".json"],
    environmentVariables: {
      NEWMAN_REPORTER: "cli,json",
    },
    icon: "📮",
  },
  {
    id: "k6",
    name: "k6 Performance",
    description: "Load testing with k6",
    image: "grafana/k6:latest",
    defaultCommand: ["k6", "run"],
    supportedFileTypes: [".js"],
    environmentVariables: {
      K6_OUT: "json=results.json",
    },
    icon: "⚡",
  },
  {
    id: "cypress",
    name: "Cypress E2E",
    description: "End-to-end testing with Cypress",
    image: "cypress/included:latest",
    defaultCommand: ["cypress", "run"],
    supportedFileTypes: [".spec.js", ".spec.ts"],
    environmentVariables: {
      CYPRESS_baseUrl: "http://localhost:3000",
    },
    icon: "🌲",
  },
  {
    id: "playwright",
    name: "Playwright",
    description: "Cross-browser testing with Playwright",
    image: "mcr.microsoft.com/playwright:latest",
    defaultCommand: ["npx", "playwright", "test"],
    supportedFileTypes: [".spec.js", ".spec.ts"],
    environmentVariables: {
      PLAYWRIGHT_BROWSERS_PATH: "/ms-playwright",
    },
    icon: "🎭",
  },
  {
    id: "jest",
    name: "Jest Unit Tests",
    description: "JavaScript unit testing with Jest",
    image: "node:18-alpine",
    defaultCommand: ["npm", "test"],
    supportedFileTypes: [".test.js", ".test.ts"],
    environmentVariables: {
      NODE_ENV: "test",
    },
    icon: "🃏",
  },
  {
    id: "pytest",
    name: "PyTest",
    description: "Python testing with PyTest",
    image: "python:3.11-alpine",
    defaultCommand: ["pytest"],
    supportedFileTypes: [".py"],
    environmentVariables: {
      PYTHONPATH: "/app",
    },
    icon: "🐍",
  },
  {
    id: "curl",
    name: "cURL/HTTP",
    description: "Simple HTTP API testing",
    image: "curlimages/curl:latest",
    defaultCommand: ["curl"],
    supportedFileTypes: [".sh"],
    environmentVariables: {},
    icon: "🌐",
  },
  {
    id: "custom",
    name: "Custom Container",
    description: "Use any custom Docker image",
    image: "",
    defaultCommand: [],
    supportedFileTypes: ["*"],
    environmentVariables: {},
    icon: "🔧",
  },
]

export function getExecutorById(id: string): TestExecutor | undefined {
  return TEST_EXECUTORS.find((executor) => executor.id === id)
}

export function getExecutorByFileType(filename: string): TestExecutor | undefined {
  return TEST_EXECUTORS.find((executor) =>
    executor.supportedFileTypes.some((type) => filename.endsWith(type) || type === "*"),
  )
}
