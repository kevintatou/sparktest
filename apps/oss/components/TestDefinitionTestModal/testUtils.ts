import type { Definition } from "@tatou/core/types"
import type { TestResult } from "./useTestDefinitionTestModal"

export function generateTestLogs(
  testDefinition: Definition,
  success: boolean,
  duration: number
): string[] {
  if (success) {
    return [
      `> Starting test: ${testDefinition.name}`,
      `> Using image: ${testDefinition.image}`,
      ...testDefinition.commands.map((cmd: string) => `> ${cmd}`),
      "",
      "✓ All tests passed",
      "✓ No errors found",
      "",
      `Test completed in ${duration}s`,
    ]
  } else {
    return [
      `> Starting test: ${testDefinition.name}`,
      `> Using image: ${testDefinition.image}`,
      ...testDefinition.commands.map((cmd: string) => `> ${cmd}`),
      "",
      "✗ Test failed",
      "Error: Connection timeout",
      "✗ 2 tests failed, 3 passed",
      "",
      `Test failed after ${duration}s`,
    ]
  }
}

export function getSimulatedTestResult(testDefinition: Definition): TestResult {
  // Simulate test result (80% success rate)
  const success = Math.random() > 0.2
  const duration = Math.floor(Math.random() * 120) + 30 // 30-150 seconds
  const logs = generateTestLogs(testDefinition, success, duration)

  return {
    success,
    message: success ? "Test completed successfully" : "Test failed with errors",
    timestamp: new Date().toISOString(),
    duration,
    logs,
  }
}

export function getTestExecutionSteps(): string[] {
  return [
    "Creating Kubernetes job...",
    "Pulling container image...",
    "Starting container...",
    "Running test commands...",
    "Collecting results...",
    "Cleaning up resources...",
  ]
}

export function getRandomDelay(): number {
  return 800 + Math.random() * 1200
}
