import { describe, it, expect } from "vitest"
import { Database, Code, Server, Shield } from "lucide-react"

// Extract the utility functions for testing
// These would normally be in a separate utils file, but for testing we'll recreate them

function getIconForTest(test: { name: string; description: string }) {
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

function generateTagsForTest(test: { name: string; description: string }): string[] {
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

describe("Test Definition Utilities", () => {
  describe("getIconForTest", () => {
    it("should return Server icon for API tests", () => {
      const test = { name: "API Load Test", description: "Tests API endpoints" }
      const icon = getIconForTest(test)
      expect(icon).toBe(Server)
    })

    it("should return Code icon for frontend tests", () => {
      const test = { name: "Frontend UI Test", description: "Tests user interface" }
      const icon = getIconForTest(test)
      expect(icon).toBe(Code)
    })

    it("should return Shield icon for security tests", () => {
      const test = { name: "Security Scan", description: "Scans for vulnerabilities" }
      const icon = getIconForTest(test)
      expect(icon).toBe(Shield)
    })

    it("should return Database icon for database tests", () => {
      const test = { name: "Database Test", description: "Tests DB operations" }
      const icon = getIconForTest(test)
      expect(icon).toBe(Database)
    })

    it("should return Server icon as default", () => {
      const test = { name: "Generic Test", description: "Some other test" }
      const icon = getIconForTest(test)
      expect(icon).toBe(Server)
    })

    it("should be case insensitive", () => {
      const test = { name: "API", description: "FRONTEND" }
      const icon = getIconForTest(test)
      expect(icon).toBe(Server) // API takes precedence in the logic
    })

    it("should check both name and description", () => {
      const test = { name: "Test 1", description: "frontend testing" }
      const icon = getIconForTest(test)
      expect(icon).toBe(Code)
    })
  })

  describe("generateTagsForTest", () => {
    it("should generate API tag", () => {
      const test = { name: "API Test", description: "Tests API endpoints" }
      const tags = generateTagsForTest(test)
      expect(tags).toContain("api")
    })

    it("should generate frontend tag", () => {
      const test = { name: "UI Test", description: "Tests frontend functionality" }
      const tags = generateTagsForTest(test)
      expect(tags).toContain("frontend")
    })

    it("should generate security tag", () => {
      const test = { name: "Security Test", description: "Scans for vulnerabilities" }
      const tags = generateTagsForTest(test)
      expect(tags).toContain("security")
    })

    it("should generate database tag", () => {
      const test = { name: "DB Test", description: "Tests database operations" }
      const tags = generateTagsForTest(test)
      expect(tags).toContain("database")
    })

    it("should generate integration tag", () => {
      const test = { name: "Integration Test", description: "Tests system integration" }
      const tags = generateTagsForTest(test)
      expect(tags).toContain("integration")
    })

    it("should generate unit tag", () => {
      const test = { name: "Unit Test", description: "Tests individual units" }
      const tags = generateTagsForTest(test)
      expect(tags).toContain("unit")
    })

    it("should generate multiple tags", () => {
      const test = { name: "Frontend API Test", description: "Integration testing for UI" }
      const tags = generateTagsForTest(test)
      expect(tags).toContain("api")
      expect(tags).toContain("frontend")
      expect(tags).toContain("integration")
      expect(tags.length).toBe(3)
    })

    it("should generate default test tag when no keywords match", () => {
      const test = { name: "Random Test", description: "Some random testing" }
      const tags = generateTagsForTest(test)
      expect(tags).toEqual(["test"])
    })

    it("should be case insensitive", () => {
      const test = { name: "API", description: "FRONTEND" }
      const tags = generateTagsForTest(test)
      expect(tags).toContain("api")
      expect(tags).toContain("frontend")
    })

    it("should handle database variations", () => {
      const test1 = { name: "Database Test", description: "Test description" }
      const test2 = { name: "DB Test", description: "Test description" }

      const tags1 = generateTagsForTest(test1)
      const tags2 = generateTagsForTest(test2)

      expect(tags1).toContain("database")
      expect(tags2).toContain("database")
    })

    it("should handle security variations", () => {
      const test1 = { name: "Security Test", description: "Test description" }
      const test2 = { name: "Scan Test", description: "Test description" }

      const tags1 = generateTagsForTest(test1)
      const tags2 = generateTagsForTest(test2)

      expect(tags1).toContain("security")
      expect(tags2).toContain("security")
    })

    it("should handle frontend variations", () => {
      const test1 = { name: "Frontend Test", description: "Test description" }
      const test2 = { name: "UI Test", description: "Test description" }

      const tags1 = generateTagsForTest(test1)
      const tags2 = generateTagsForTest(test2)

      expect(tags1).toContain("frontend")
      expect(tags2).toContain("frontend")
    })
  })
})
