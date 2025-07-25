import type { TestSuite } from "@sparktest/core/types"

export function validateSuiteData(formData: {
  name: string
  testDefinitionIds: string[]
}) {
  const errors: string[] = []
  
  if (!formData.name.trim()) {
    errors.push("Suite name is required")
  }
  
  if (formData.testDefinitionIds.length === 0) {
    errors.push("Please select at least one test definition")
  }
  
  return errors
}

export function prepareSuiteData(formData: any, existingSuite?: TestSuite): TestSuite {
  return {
    ...formData,
    createdAt: existingSuite?.createdAt || new Date().toISOString(),
  }
}

export function getExecutionModeDescription(mode: "sequential" | "parallel"): string {
  switch (mode) {
    case "sequential":
      return "Sequential - Run tests one after another"
    case "parallel":
      return "Parallel - Run tests simultaneously"
    default:
      return ""
  }
}