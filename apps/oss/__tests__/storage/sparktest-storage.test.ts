import { describe, it, expect, beforeEach, vi } from "vitest"
import { SparkTestStorageService } from "@tatou/storage-service/sparktest-storage"
import type { Executor, Definition, Run, Suite } from "@tatou/core/types"

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
})

describe("SparkTestStorageService", () => {
  let service: SparkTestStorageService

  beforeEach(() => {
    vi.clearAllMocks()
    // Mock fetch for API tests
    global.fetch = vi.fn()
    service = new SparkTestStorageService()
  })

  describe("executors", () => {
    const mockExecutor: Executor = {
      id: "1",
      name: "Test Executor",
      image: "test:latest",
      createdAt: new Date().toISOString(),
    }

    it("should get executors", async () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify([mockExecutor]))

      const result = await service.getExecutors()
      expect(Array.isArray(result)).toBe(true)
    })

    it("should save executor", async () => {
      localStorageMock.getItem.mockReturnValue("[]")

      const result = await service.saveExecutor(mockExecutor)
      expect(result).toEqual(mockExecutor)
    })

    it("should delete executor", async () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify([mockExecutor]))

      const result = await service.deleteExecutor("1")
      expect(result).toBe(true)
    })

    it("should get executor by id", async () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify([mockExecutor]))

      const result = await service.getExecutorById("1")
      expect(result).toEqual(mockExecutor)
    })
  })

  describe("definitions", () => {
    const mockDefinition: Definition = {
      id: "1",
      name: "Test Definition",
      description: "Test description",
      image: "test:latest",
      commands: ["echo", "hello"],
      createdAt: new Date().toISOString(),
    }

    it("should get definitions", async () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify([mockDefinition]))

      const result = await service.getDefinitions()
      expect(Array.isArray(result)).toBe(true)
    })

    it("should save definition", async () => {
      localStorageMock.getItem.mockReturnValue("[]")

      const result = await service.saveDefinition(mockDefinition)
      expect(result).toEqual(mockDefinition)
    })

    it("should delete definition", async () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify([mockDefinition]))

      const result = await service.deleteDefinition("1")
      expect(result).toBe(true)
    })

    it("should get definition by id", async () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify([mockDefinition]))

      const result = await service.getDefinitionById("1")
      expect(result).toEqual(mockDefinition)
    })
  })

  describe("runs", () => {
    const mockRun: Run = {
      id: "1",
      name: "Test Run",
      image: "test:latest",
      command: ["echo", "hello"],
      status: "running",
      createdAt: new Date().toISOString(),
    }

    it("should get runs", async () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify([mockRun]))

      const result = await service.getRuns()
      expect(Array.isArray(result)).toBe(true)
    })

    it("should save run", async () => {
      localStorageMock.getItem.mockReturnValue("[]")

      const result = await service.saveRun(mockRun)
      expect(result).toEqual(mockRun)
    })

    it("should delete run", async () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify([mockRun]))

      const result = await service.deleteRun("1")
      expect(result).toBe(true)
    })

    it("should get run by id", async () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify([mockRun]))

      const result = await service.getRunById("1")
      expect(result).toEqual(mockRun)
    })

    it("should create run from definition", async () => {
      const mockDefinition: Definition = {
        id: "def1",
        name: "Test Definition",
        description: "Test description",
        image: "test:latest",
        commands: ["echo", "hello"],
        createdAt: new Date().toISOString(),
      }

      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify([mockDefinition])) // getDefinitions
      localStorageMock.getItem.mockReturnValueOnce("[]") // getRuns

      const result = await service.createRun("def1", { name: "Custom Run" })

      expect(result.name).toBe("Custom Run")
      expect(result.status).toBe("running")
      expect(result.definitionId).toBe("def1")
    })

    it("should subscribe to runs", () => {
      const callback = vi.fn()
      const unsubscribe = service.subscribeToRuns(callback)

      expect(typeof unsubscribe).toBe("function")
      unsubscribe()
    })
  })

  describe("suites", () => {
    const mockSuite: Suite = {
      id: "1",
      name: "Test Suite",
      description: "Test description",
      testDefinitionIds: ["def1", "def2"],
      createdAt: new Date().toISOString(),
      executionMode: "sequential",
    }

    it("should get suites", async () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify([mockSuite]))

      const result = await service.getSuites()
      expect(Array.isArray(result)).toBe(true)
    })

    it("should save suite", async () => {
      localStorageMock.getItem.mockReturnValue("[]")

      const result = await service.saveSuite(mockSuite)
      expect(result).toEqual(mockSuite)
    })

    it("should delete suite", async () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify([mockSuite]))

      const result = await service.deleteSuite("1")
      expect(result).toBe(true)
    })

    it("should get suite by id", async () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify([mockSuite]))

      const result = await service.getSuiteById("1")
      expect(result).toEqual(mockSuite)
    })
  })

  describe("kubernetes integration", () => {
    it("should throw error for kubernetes health when API fails", async () => {
      const mockFetch = global.fetch as any
      mockFetch.mockRejectedValueOnce(new Error("Network error"))

      await expect(service.getKubernetesHealth()).rejects.toThrow(
        "Kubernetes integration not available"
      )
    })

    it("should throw error for test run logs when API fails", async () => {
      const mockFetch = global.fetch as any
      mockFetch.mockRejectedValueOnce(new Error("Network error"))

      await expect(service.getTestRunLogs("run1")).rejects.toThrow(
        "Kubernetes integration not available"
      )
    })

    it("should throw error for job logs when API fails", async () => {
      const mockFetch = global.fetch as any
      mockFetch.mockRejectedValueOnce(new Error("Network error"))

      await expect(service.getJobLogs("job1")).rejects.toThrow(
        "Kubernetes integration not available"
      )
    })

    it("should throw error for job status when API fails", async () => {
      const mockFetch = global.fetch as any
      mockFetch.mockRejectedValueOnce(new Error("Network error"))

      await expect(service.getJobStatus("job1")).rejects.toThrow(
        "Kubernetes integration not available"
      )
    })

    it("should throw error for delete job when API fails", async () => {
      const mockFetch = global.fetch as any
      mockFetch.mockRejectedValueOnce(new Error("Network error"))

      await expect(service.deleteJob("job1")).rejects.toThrow(
        "Kubernetes integration not available"
      )
    })
  })

  describe("initialization", () => {
    it("should initialize all storage services", async () => {
      localStorageMock.getItem.mockReturnValue(null)

      await service.initialize()

      // Should initialize localStorage with default items
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "sparktest_executors",
        expect.any(String)
      )
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "sparktest_definitions",
        expect.any(String)
      )
      expect(localStorageMock.setItem).toHaveBeenCalledWith("sparktest_runs", expect.any(String))
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "sparktest_test_suites",
        expect.any(String)
      )
    })
  })
})
