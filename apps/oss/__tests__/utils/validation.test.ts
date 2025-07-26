import { describe, it, expect } from "vitest"
import {
  sanitizeName,
  sanitizeDescription,
  validateDockerImage,
  sanitizeCommands,
  sanitizeLabels,
  validateExecutionMode,
  validateDefinition,
  validateTestExecutor,
  validateSuite,
} from "../../utils/validation"

describe("Frontend Validation Utilities", () => {
  describe("sanitizeName", () => {
    it("should accept valid names", () => {
      expect(sanitizeName("Valid Name")).toEqual({
        isValid: true,
        sanitizedValue: "Valid Name",
      })
      expect(sanitizeName("test-name_123")).toEqual({
        isValid: true,
        sanitizedValue: "test-name_123",
      })
      expect(sanitizeName("  spaced  ")).toEqual({
        isValid: true,
        sanitizedValue: "spaced",
      })
    })

    it("should reject invalid names", () => {
      expect(sanitizeName("")).toEqual({
        isValid: false,
        error: "Name cannot be empty",
      })
      expect(sanitizeName("   ")).toEqual({
        isValid: false,
        error: "Name cannot be empty",
      })
      expect(sanitizeName("name@with$pecial")).toEqual({
        isValid: false,
        error:
          "Name contains invalid characters. Only alphanumeric characters, spaces, hyphens, underscores, and periods are allowed",
      })
      expect(sanitizeName("a".repeat(300))).toEqual({
        isValid: false,
        error: "Name too long: 300 characters (max 255)",
      })
    })
  })

  describe("sanitizeDescription", () => {
    it("should accept valid descriptions", () => {
      expect(sanitizeDescription("Valid description")).toEqual({
        isValid: true,
        sanitizedValue: "Valid description",
      })
      expect(sanitizeDescription("")).toEqual({
        isValid: true,
        sanitizedValue: "",
      })
    })

    it("should escape HTML characters", () => {
      const desc = '<script>alert("xss")</script>'
      const result = sanitizeDescription(desc)
      expect(result.isValid).toBe(true)
      expect(result.sanitizedValue).not.toContain("<script>")
      expect(result.sanitizedValue).toContain("&amp;lt;script&amp;gt;")
    })

    it("should reject descriptions that are too long", () => {
      const longDesc = "a".repeat(1001)
      expect(sanitizeDescription(longDesc)).toEqual({
        isValid: false,
        error: "Description too long: 1001 characters (max 1000)",
      })
    })
  })

  describe("validateDockerImage", () => {
    it("should accept valid Docker image names", () => {
      expect(validateDockerImage("nginx:latest")).toEqual({
        isValid: true,
        sanitizedValue: "nginx:latest",
      })
      expect(validateDockerImage("registry.com/user/repo:tag")).toEqual({
        isValid: true,
        sanitizedValue: "registry.com/user/repo:tag",
      })
      expect(validateDockerImage("ubuntu")).toEqual({
        isValid: true,
        sanitizedValue: "ubuntu",
      })
    })

    it("should reject invalid Docker image names", () => {
      expect(validateDockerImage("")).toEqual({
        isValid: false,
        error: "Docker image cannot be empty",
      })
      expect(validateDockerImage("image$(whoami)")).toEqual({
        isValid: false,
        error: "Docker image contains potentially dangerous characters",
      })
      expect(validateDockerImage("image;rm -rf /")).toEqual({
        isValid: false,
        error: "Docker image contains potentially dangerous characters",
      })
      expect(validateDockerImage("../malicious")).toEqual({
        isValid: false,
        error: "Docker image contains potentially dangerous characters",
      })
    })
  })

  describe("sanitizeCommands", () => {
    it("should accept valid commands", () => {
      const commands = ["echo", "hello"]
      expect(sanitizeCommands(commands)).toEqual({
        isValid: true,
        sanitizedValue: ["echo", "hello"],
      })
    })

    it("should reject invalid commands", () => {
      expect(sanitizeCommands([])).toEqual({
        isValid: false,
        error: "Commands cannot be empty",
      })
      expect(sanitizeCommands(["rm -rf /"])).toEqual({
        isValid: false,
        error: "Command contains potentially dangerous pattern: rm -rf",
      })
      expect(sanitizeCommands(["echo $(whoami)"])).toEqual({
        isValid: false,
        error: "Command contains potentially dangerous pattern: $(",
      })
      expect(sanitizeCommands(["cmd;malicious"])).toEqual({
        isValid: false,
        error: "Command contains potentially dangerous pattern: ;",
      })
    })

    it("should filter out empty commands", () => {
      const commands = ["echo", "", "  ", "hello"]
      expect(sanitizeCommands(commands)).toEqual({
        isValid: true,
        sanitizedValue: ["echo", "hello"],
      })
    })
  })

  describe("sanitizeLabels", () => {
    it("should accept valid labels", () => {
      const labels = ["test", "production"]
      expect(sanitizeLabels(labels)).toEqual({
        isValid: true,
        sanitizedValue: ["test", "production"],
      })
    })

    it("should remove duplicates and normalize case", () => {
      const labels = ["test", "TEST", "test"]
      expect(sanitizeLabels(labels)).toEqual({
        isValid: true,
        sanitizedValue: ["test"],
      })
    })

    it("should reject invalid labels", () => {
      expect(sanitizeLabels(["test@invalid"])).toEqual({
        isValid: false,
        error:
          "Label contains invalid characters. Only alphanumeric characters, hyphens, underscores, and periods are allowed",
      })
      expect(sanitizeLabels(["a".repeat(101)])).toEqual({
        isValid: false,
        error: "Label too long: 101 characters (max 100)",
      })
    })
  })

  describe("validateExecutionMode", () => {
    it("should accept valid execution modes", () => {
      expect(validateExecutionMode("sequential")).toEqual({
        isValid: true,
        sanitizedValue: "sequential",
      })
      expect(validateExecutionMode("PARALLEL")).toEqual({
        isValid: true,
        sanitizedValue: "parallel",
      })
    })

    it("should reject invalid execution modes", () => {
      expect(validateExecutionMode("invalid")).toEqual({
        isValid: false,
        error: "Execution mode must be 'sequential' or 'parallel'",
      })
    })
  })

  describe("validateDefinition", () => {
    it("should accept valid test definition", () => {
      const data = {
        name: "Test Definition",
        description: "A test definition",
        image: "nginx:latest",
        commands: ["echo", "hello"],
      }
      expect(validateDefinition(data)).toEqual({
        isValid: true,
        errors: {},
      })
    })

    it("should reject invalid test definition", () => {
      const data = {
        name: "",
        description: "Valid description",
        image: "invalid@image",
        commands: ["rm -rf /"],
      }
      const result = validateDefinition(data)
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveProperty("name")
      expect(result.errors).toHaveProperty("image")
      expect(result.errors).toHaveProperty("commands")
    })
  })

  describe("validateTestExecutor", () => {
    it("should accept valid test executor", () => {
      const data = {
        name: "Test Executor",
        description: "A test executor",
        image: "node:18",
        default_command: "npm test",
      }
      expect(validateTestExecutor(data)).toEqual({
        isValid: true,
        errors: {},
      })
    })

    it("should reject invalid test executor", () => {
      const data = {
        name: "",
        description: "Valid description",
        image: "invalid@image",
        default_command: "rm -rf /",
      }
      const result = validateTestExecutor(data)
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveProperty("name")
      expect(result.errors).toHaveProperty("image")
      expect(result.errors).toHaveProperty("default_command")
    })
  })

  describe("validateSuite", () => {
    it("should accept valid test suite", () => {
      const data = {
        name: "Test Suite",
        description: "A test suite",
        execution_mode: "sequential",
        labels: ["test", "integration"],
      }
      expect(validateSuite(data)).toEqual({
        isValid: true,
        errors: {},
      })
    })

    it("should reject invalid test suite", () => {
      const data = {
        name: "",
        description: "Valid description",
        execution_mode: "invalid",
        labels: ["test@invalid"],
      }
      const result = validateSuite(data)
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveProperty("name")
      expect(result.errors).toHaveProperty("execution_mode")
      expect(result.errors).toHaveProperty("labels")
    })
  })
})
