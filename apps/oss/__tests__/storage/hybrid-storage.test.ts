import { describe, it, expect, beforeEach, vi, afterEach } from "vitest"
import { HybridStorageService } from "@sparktest/storage-service/hybrid-storage"
import { ApiStorageService } from "@sparktest/storage-service/api-storage"
import { LocalStorageService } from "@sparktest/storage-service/local-storage"

// Mock the storage services
vi.mock("@sparktest/storage-service/api-storage")
vi.mock("@sparktest/storage-service/local-storage")

const mockApiStorage = vi.mocked(ApiStorageService)
const mockLocalStorage = vi.mocked(LocalStorageService)

describe("HybridStorageService", () => {
  let service: HybridStorageService
  let apiInstance: any
  let localInstance: any

  beforeEach(() => {
    apiInstance = {
      getExecutors: vi.fn(),
      saveExecutor: vi.fn(),
      deleteExecutor: vi.fn(),
      getExecutorById: vi.fn(),
      getDefinitions: vi.fn(),
      saveDefinition: vi.fn(),
      deleteDefinition: vi.fn(),
      getDefinitionById: vi.fn(),
      getRuns: vi.fn(),
      saveRun: vi.fn(),
      deleteRun: vi.fn(),
      getRunById: vi.fn(),
      createRun: vi.fn(),
      subscribeToRuns: vi.fn(),
      getSuites: vi.fn(),
      saveSuite: vi.fn(),
      deleteSuite: vi.fn(),
      getSuiteById: vi.fn(),
      initialize: vi.fn(),
      getKubernetesHealth: vi.fn(),
      getTestRunLogs: vi.fn(),
      getJobLogs: vi.fn(),
      getJobStatus: vi.fn(),
      deleteJob: vi.fn(),
    }

    localInstance = {
      getExecutors: vi.fn(),
      saveExecutor: vi.fn(),
      deleteExecutor: vi.fn(),
      getExecutorById: vi.fn(),
      getDefinitions: vi.fn(),
      saveDefinition: vi.fn(),
      deleteDefinition: vi.fn(),
      getDefinitionById: vi.fn(),
      getRuns: vi.fn(),
      saveRun: vi.fn(),
      deleteRun: vi.fn(),
      getRunById: vi.fn(),
      createRun: vi.fn(),
      subscribeToRuns: vi.fn(),
      getSuites: vi.fn(),
      saveSuite: vi.fn(),
      deleteSuite: vi.fn(),
      getSuiteById: vi.fn(),
      getKubernetesHealth: vi.fn(),
      getTestRunLogs: vi.fn(),
      getJobLogs: vi.fn(),
      getJobStatus: vi.fn(),
      deleteJob: vi.fn(),
      initialize: vi.fn(),
    }

    mockApiStorage.mockImplementation(() => apiInstance)
    mockLocalStorage.mockImplementation(() => localInstance)

    service = new HybridStorageService()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe("fallback mechanism", () => {
    it("should use API when available", async () => {
      const mockExecutors = [{ id: "1", name: "Test Executor" }]
      apiInstance.getExecutors.mockResolvedValue(mockExecutors)

      const result = await service.getExecutors()

      expect(apiInstance.getExecutors).toHaveBeenCalled()
      expect(localInstance.getExecutors).not.toHaveBeenCalled()
      expect(result).toEqual(mockExecutors)
    })

    it("should fallback to local storage when API fails", async () => {
      const mockExecutors = [{ id: "1", name: "Test Executor" }]
      apiInstance.getExecutors.mockRejectedValue(new Error("API Error"))
      localInstance.getExecutors.mockResolvedValue(mockExecutors)

      const result = await service.getExecutors()

      expect(apiInstance.getExecutors).toHaveBeenCalled()
      expect(localInstance.getExecutors).toHaveBeenCalled()
      expect(result).toEqual(mockExecutors)
    })
  })

  describe("executors", () => {
    it("should handle saveExecutor with fallback", async () => {
      const mockExecutor = {
        id: "1",
        name: "Test Executor",
        image: "test",
        createdAt: "2023-01-01",
      }
      apiInstance.saveExecutor.mockRejectedValue(new Error("Network Error"))
      localInstance.saveExecutor.mockResolvedValue(mockExecutor)

      const result = await service.saveExecutor(mockExecutor)

      expect(apiInstance.saveExecutor).toHaveBeenCalledWith(mockExecutor)
      expect(localInstance.saveExecutor).toHaveBeenCalledWith(mockExecutor)
      expect(result).toEqual(mockExecutor)
    })

    it("should handle deleteExecutor with fallback", async () => {
      apiInstance.deleteExecutor.mockRejectedValue(new Error("Network Error"))
      localInstance.deleteExecutor.mockResolvedValue(true)

      const result = await service.deleteExecutor("1")

      expect(apiInstance.deleteExecutor).toHaveBeenCalledWith("1")
      expect(localInstance.deleteExecutor).toHaveBeenCalledWith("1")
      expect(result).toBe(true)
    })

    it("should handle getExecutorById with fallback", async () => {
      const mockExecutor = {
        id: "1",
        name: "Test Executor",
        image: "test",
        createdAt: "2023-01-01",
      }
      apiInstance.getExecutorById.mockRejectedValue(new Error("Network Error"))
      localInstance.getExecutorById.mockResolvedValue(mockExecutor)

      const result = await service.getExecutorById("1")

      expect(apiInstance.getExecutorById).toHaveBeenCalledWith("1")
      expect(localInstance.getExecutorById).toHaveBeenCalledWith("1")
      expect(result).toEqual(mockExecutor)
    })
  })

  describe("definitions", () => {
    it("should handle getDefinitions with fallback", async () => {
      const mockDefinitions = [{ id: "1", name: "Test Definition" }]
      apiInstance.getDefinitions.mockRejectedValue(new Error("Network Error"))
      localInstance.getDefinitions.mockResolvedValue(mockDefinitions)

      const result = await service.getDefinitions()

      expect(apiInstance.getDefinitions).toHaveBeenCalled()
      expect(localInstance.getDefinitions).toHaveBeenCalled()
      expect(result).toEqual(mockDefinitions)
    })
  })

  describe("runs", () => {
    it("should handle getRuns with fallback", async () => {
      const mockRuns = [{ id: "1", name: "Test Run", status: "running" }]
      apiInstance.getRuns.mockRejectedValue(new Error("Network Error"))
      localInstance.getRuns.mockResolvedValue(mockRuns)

      const result = await service.getRuns()

      expect(apiInstance.getRuns).toHaveBeenCalled()
      expect(localInstance.getRuns).toHaveBeenCalled()
      expect(result).toEqual(mockRuns)
    })

    it("should handle createRun with fallback", async () => {
      const mockRun = { id: "1", name: "Test Run", status: "running" }
      apiInstance.createRun.mockRejectedValue(new Error("Network Error"))
      localInstance.createRun.mockResolvedValue(mockRun)

      const result = await service.createRun("def1", { name: "Custom Run" })

      expect(apiInstance.createRun).toHaveBeenCalledWith("def1", { name: "Custom Run" })
      expect(localInstance.createRun).toHaveBeenCalledWith("def1", { name: "Custom Run" })
      expect(result).toEqual(mockRun)
    })
  })

  describe("subscribeToRuns", () => {
    it("should try API subscription first", () => {
      const mockCallback = vi.fn()
      const mockUnsubscribe = vi.fn()
      apiInstance.subscribeToRuns.mockReturnValue(mockUnsubscribe)

      const result = service.subscribeToRuns(mockCallback)

      expect(apiInstance.subscribeToRuns).toHaveBeenCalledWith(mockCallback)
      expect(localInstance.subscribeToRuns).not.toHaveBeenCalled()
      expect(result).toBe(mockUnsubscribe)
    })

    it("should fallback to local storage subscription when API fails", () => {
      const mockCallback = vi.fn()
      const mockUnsubscribe = vi.fn()
      apiInstance.subscribeToRuns.mockImplementation(() => {
        throw new Error("API Error")
      })
      localInstance.subscribeToRuns.mockReturnValue(mockUnsubscribe)

      const result = service.subscribeToRuns(mockCallback)

      expect(apiInstance.subscribeToRuns).toHaveBeenCalledWith(mockCallback)
      expect(localInstance.subscribeToRuns).toHaveBeenCalledWith(mockCallback)
      expect(result).toBe(mockUnsubscribe)
    })
  })

  describe("test suites", () => {
    it("should handle getSuites with fallback", async () => {
      const mockSuites = [
        {
          id: "1",
          name: "Test Suite",
          description: "",
          testDefinitionIds: [],
          executionMode: "sequential" as const,
          createdAt: "2023-01-01",
          labels: [],
        },
      ]
      apiInstance.getSuites.mockRejectedValue(new Error("Network Error"))
      localInstance.getSuites.mockResolvedValue(mockSuites)

      const result = await service.getSuites()

      expect(apiInstance.getSuites).toHaveBeenCalled()
      expect(localInstance.getSuites).toHaveBeenCalled()
      expect(result).toEqual(mockSuites)
    })
  })

  describe("initialize", () => {
    it("should initialize both storage services", async () => {
      await service.initialize()

      expect(apiInstance.initialize).toHaveBeenCalled()
      expect(localInstance.initialize).toHaveBeenCalled()
    })
  })

  describe("missing API methods with fallback", () => {
    it("should handle saveDefinition with fallback", async () => {
      const mockDefinition = {
        id: "1",
        name: "Test Definition",
        description: "desc",
        image: "test",
        commands: ["echo"],
        createdAt: "2023-01-01",
      }
      apiInstance.saveDefinition.mockRejectedValue(new Error("Network Error"))
      localInstance.saveDefinition.mockResolvedValue(mockDefinition)

      const result = await service.saveDefinition(mockDefinition)

      expect(apiInstance.saveDefinition).toHaveBeenCalledWith(mockDefinition)
      expect(localInstance.saveDefinition).toHaveBeenCalledWith(mockDefinition)
      expect(result).toEqual(mockDefinition)
    })

    it("should handle deleteDefinition with fallback", async () => {
      apiInstance.deleteDefinition.mockRejectedValue(new Error("Network Error"))
      localInstance.deleteDefinition.mockResolvedValue(true)

      const result = await service.deleteDefinition("1")

      expect(apiInstance.deleteDefinition).toHaveBeenCalledWith("1")
      expect(localInstance.deleteDefinition).toHaveBeenCalledWith("1")
      expect(result).toBe(true)
    })

    it("should handle getDefinitionById with fallback", async () => {
      const mockDefinition = {
        id: "1",
        name: "Test Definition",
        description: "desc",
        image: "test",
        commands: ["echo"],
        createdAt: "2023-01-01",
      }
      apiInstance.getDefinitionById.mockRejectedValue(new Error("Network Error"))
      localInstance.getDefinitionById.mockResolvedValue(mockDefinition)

      const result = await service.getDefinitionById("1")

      expect(apiInstance.getDefinitionById).toHaveBeenCalledWith("1")
      expect(localInstance.getDefinitionById).toHaveBeenCalledWith("1")
      expect(result).toEqual(mockDefinition)
    })

    it("should handle saveRun with fallback", async () => {
      const mockRun = {
        id: "1",
        name: "Test Run",
        status: "running" as const,
        createdAt: "2023-01-01",
        image: "test:latest",
        command: ["echo", "test"],
      }
      apiInstance.saveRun.mockRejectedValue(new Error("Network Error"))
      localInstance.saveRun.mockResolvedValue(mockRun)

      const result = await service.saveRun(mockRun)

      expect(apiInstance.saveRun).toHaveBeenCalledWith(mockRun)
      expect(localInstance.saveRun).toHaveBeenCalledWith(mockRun)
      expect(result).toEqual(mockRun)
    })

    it("should handle deleteRun with fallback", async () => {
      apiInstance.deleteRun.mockRejectedValue(new Error("Network Error"))
      localInstance.deleteRun.mockResolvedValue(true)

      const result = await service.deleteRun("1")

      expect(apiInstance.deleteRun).toHaveBeenCalledWith("1")
      expect(localInstance.deleteRun).toHaveBeenCalledWith("1")
      expect(result).toBe(true)
    })

    it("should handle getRunById with fallback", async () => {
      const mockRun = {
        id: "1",
        name: "Test Run",
        status: "running" as const,
        createdAt: "2023-01-01",
        image: "test:latest",
        command: ["echo", "test"],
      }
      apiInstance.getRunById.mockRejectedValue(new Error("Network Error"))
      localInstance.getRunById.mockResolvedValue(mockRun)

      const result = await service.getRunById("1")

      expect(apiInstance.getRunById).toHaveBeenCalledWith("1")
      expect(localInstance.getRunById).toHaveBeenCalledWith("1")
      expect(result).toEqual(mockRun)
    })

    it("should handle saveSuite with fallback", async () => {
      const mockSuite = {
        id: "1",
        name: "Test Suite",
        description: "",
        testDefinitionIds: [],
        executionMode: "sequential" as const,
        createdAt: "2023-01-01",
        labels: [],
      }
      apiInstance.saveSuite.mockRejectedValue(new Error("Network Error"))
      localInstance.saveSuite.mockResolvedValue(mockSuite)

      const result = await service.saveSuite(mockSuite)

      expect(apiInstance.saveSuite).toHaveBeenCalledWith(mockSuite)
      expect(localInstance.saveSuite).toHaveBeenCalledWith(mockSuite)
      expect(result).toEqual(mockSuite)
    })

    it("should handle deleteSuite with fallback", async () => {
      apiInstance.deleteSuite.mockRejectedValue(new Error("Network Error"))
      localInstance.deleteSuite.mockResolvedValue(true)

      const result = await service.deleteSuite("1")

      expect(apiInstance.deleteSuite).toHaveBeenCalledWith("1")
      expect(localInstance.deleteSuite).toHaveBeenCalledWith("1")
      expect(result).toBe(true)
    })

    it("should handle getSuiteById with fallback", async () => {
      const mockSuite = {
        id: "1",
        name: "Test Suite",
        description: "",
        testDefinitionIds: [],
        executionMode: "sequential" as const,
        createdAt: "2023-01-01",
        labels: [],
      }
      apiInstance.getSuiteById.mockRejectedValue(new Error("Network Error"))
      localInstance.getSuiteById.mockResolvedValue(mockSuite)

      const result = await service.getSuiteById("1")

      expect(apiInstance.getSuiteById).toHaveBeenCalledWith("1")
      expect(localInstance.getSuiteById).toHaveBeenCalledWith("1")
      expect(result).toEqual(mockSuite)
    })
  })

  describe("kubernetes methods with fallback", () => {
    it("should handle getKubernetesHealth with fallback", async () => {
      const mockHealth = { healthy: true, cluster_info: { name: "test", version: "v1.25" } }
      apiInstance.getKubernetesHealth.mockRejectedValue(new Error("Network Error"))
      localInstance.getKubernetesHealth.mockResolvedValue(mockHealth)

      const result = await service.getKubernetesHealth()

      expect(apiInstance.getKubernetesHealth).toHaveBeenCalled()
      expect(localInstance.getKubernetesHealth).toHaveBeenCalled()
      expect(result).toEqual(mockHealth)
    })

    it("should handle getTestRunLogs with fallback", async () => {
      const mockLogs = { job_name: "test-job", logs: "test logs", pod_status: "Running" }
      apiInstance.getTestRunLogs.mockRejectedValue(new Error("Network Error"))
      localInstance.getTestRunLogs.mockResolvedValue(mockLogs)

      const result = await service.getTestRunLogs("run123")

      expect(apiInstance.getTestRunLogs).toHaveBeenCalledWith("run123")
      expect(localInstance.getTestRunLogs).toHaveBeenCalledWith("run123")
      expect(result).toEqual(mockLogs)
    })

    it("should handle getJobLogs with fallback", async () => {
      const mockLogs = { job_name: "test-job", logs: "job logs", pod_status: "Succeeded" }
      apiInstance.getJobLogs.mockRejectedValue(new Error("Network Error"))
      localInstance.getJobLogs.mockResolvedValue(mockLogs)

      const result = await service.getJobLogs("job123")

      expect(apiInstance.getJobLogs).toHaveBeenCalledWith("job123")
      expect(localInstance.getJobLogs).toHaveBeenCalledWith("job123")
      expect(result).toEqual(mockLogs)
    })

    it("should handle getJobStatus with fallback", async () => {
      const mockStatus = {
        job_name: "test-job",
        status: "Running",
        active: 1,
        succeeded: 0,
        failed: 0,
      }
      apiInstance.getJobStatus.mockRejectedValue(new Error("Network Error"))
      localInstance.getJobStatus.mockResolvedValue(mockStatus)

      const result = await service.getJobStatus("job123")

      expect(apiInstance.getJobStatus).toHaveBeenCalledWith("job123")
      expect(localInstance.getJobStatus).toHaveBeenCalledWith("job123")
      expect(result).toEqual(mockStatus)
    })

    it("should handle deleteJob with fallback", async () => {
      const mockResponse = { success: true, message: "Job deleted" }
      apiInstance.deleteJob.mockRejectedValue(new Error("Network Error"))
      localInstance.deleteJob.mockResolvedValue(mockResponse)

      const result = await service.deleteJob("job123")

      expect(apiInstance.deleteJob).toHaveBeenCalledWith("job123")
      expect(localInstance.deleteJob).toHaveBeenCalledWith("job123")
      expect(result).toEqual(mockResponse)
    })
  })

  describe("error handling", () => {
    it("should try API first and only fallback on failure", async () => {
      const mockExecutors = [
        { id: "1", name: "Test Executor", image: "test", createdAt: "2023-01-01" },
      ]
      apiInstance.getExecutors.mockResolvedValue(mockExecutors)

      const result = await service.getExecutors()

      expect(apiInstance.getExecutors).toHaveBeenCalled()
      expect(localInstance.getExecutors).not.toHaveBeenCalled()
      expect(result).toEqual(mockExecutors)
    })

    it("should handle both API and local storage failures gracefully", async () => {
      apiInstance.getExecutors.mockRejectedValue(new Error("API Error"))
      localInstance.getExecutors.mockRejectedValue(new Error("Local Storage Error"))

      await expect(service.getExecutors()).rejects.toThrow("Local Storage Error")
      expect(apiInstance.getExecutors).toHaveBeenCalled()
      expect(localInstance.getExecutors).toHaveBeenCalled()
    })

    it("should handle different types of API errors", async () => {
      const mockExecutors = [{ id: "1", name: "Test", image: "test", createdAt: "2023-01-01" }]

      // Test network timeout
      apiInstance.getExecutors.mockRejectedValue(new Error("ETIMEDOUT"))
      localInstance.getExecutors.mockResolvedValue(mockExecutors)

      const result = await service.getExecutors()
      expect(result).toEqual(mockExecutors)

      // Test 500 error
      apiInstance.getExecutors.mockRejectedValue(new Error("Internal Server Error"))
      localInstance.getExecutors.mockResolvedValue(mockExecutors)

      const result2 = await service.getExecutors()
      expect(result2).toEqual(mockExecutors)
    })
  })

  describe("subscription edge cases", () => {
    it("should return a no-op unsubscribe function when both API and local fail", () => {
      const mockCallback = vi.fn()
      apiInstance.subscribeToRuns.mockImplementation(() => {
        throw new Error("API Error")
      })
      localInstance.subscribeToRuns.mockImplementation(() => {
        throw new Error("Local Error")
      })

      const unsubscribe = service.subscribeToRuns(mockCallback)

      expect(typeof unsubscribe).toBe("function")
      expect(() => unsubscribe()).not.toThrow()
    })

    it("should handle API subscription returning null/undefined", () => {
      const mockCallback = vi.fn()
      const mockUnsubscribe = vi.fn()
      apiInstance.subscribeToRuns.mockReturnValue(null as any)
      localInstance.subscribeToRuns.mockReturnValue(mockUnsubscribe)

      const result = service.subscribeToRuns(mockCallback)

      expect(apiInstance.subscribeToRuns).toHaveBeenCalledWith(mockCallback)
      expect(localInstance.subscribeToRuns).toHaveBeenCalledWith(mockCallback)
      expect(result).toBe(mockUnsubscribe)
    })
  })
})
