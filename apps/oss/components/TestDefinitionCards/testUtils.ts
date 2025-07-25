import { Code, Database, Server, Shield } from "lucide-react"
import type { Definition } from "@tatou/core/types"
import type { LucideIcon } from "lucide-react"

// Map of icons for different test types
export const iconMap: Record<string, LucideIcon> = {
  api: Server,
  frontend: Code,
  security: Shield,
  database: Database,
}

// Function to determine icon based on test name or description
export function getIconForTest(test: Definition) {
  const testNameLower = test.name.toLowerCase()
  const descriptionLower = test.description.toLowerCase()

  if (testNameLower.includes("api") || descriptionLower.includes("api")) {
    return Server
  } else if (
    testNameLower.includes("frontend") ||
    testNameLower.includes("ui") ||
    descriptionLower.includes("frontend") ||
    descriptionLower.includes("ui")
  ) {
    return Code
  } else if (
    testNameLower.includes("security") ||
    testNameLower.includes("scan") ||
    descriptionLower.includes("security") ||
    descriptionLower.includes("scan")
  ) {
    return Shield
  } else if (
    testNameLower.includes("database") ||
    testNameLower.includes("db") ||
    descriptionLower.includes("database") ||
    descriptionLower.includes("db")
  ) {
    return Database
  }

  // Default icon
  return Server
}

// Function to generate tags based on test properties
export function generateTagsForTest(test: Definition): string[] {
  const tags: string[] = []
  const testNameLower = test.name.toLowerCase()
  const descriptionLower = test.description.toLowerCase()

  if (testNameLower.includes("api") || descriptionLower.includes("api")) {
    tags.push("api")
  }
  if (
    testNameLower.includes("frontend") ||
    testNameLower.includes("ui") ||
    descriptionLower.includes("frontend") ||
    descriptionLower.includes("ui")
  ) {
    tags.push("frontend")
  }
  if (
    testNameLower.includes("security") ||
    testNameLower.includes("scan") ||
    descriptionLower.includes("security") ||
    descriptionLower.includes("scan")
  ) {
    tags.push("security")
  }
  if (
    testNameLower.includes("database") ||
    testNameLower.includes("db") ||
    descriptionLower.includes("database") ||
    descriptionLower.includes("db")
  ) {
    tags.push("database")
  }
  if (testNameLower.includes("integration") || descriptionLower.includes("integration")) {
    tags.push("integration")
  }
  if (testNameLower.includes("unit") || descriptionLower.includes("unit")) {
    tags.push("unit")
  }

  // If no tags were generated, add a generic one
  if (tags.length === 0) {
    tags.push("test")
  }

  return tags
}
