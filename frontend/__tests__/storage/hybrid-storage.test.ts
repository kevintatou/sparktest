import { describe, it, expect, beforeEach, vi, afterEach } from "vitest"
import { HybridStorageService } from "@/lib/storage/hybrid-storage"
import { ApiStorageService } from "@/lib/storage/api-storage"
import { LocalStorageService } from "@/lib/storage/local-storage"

// Mock the storage services
vi.mock("@/lib/storage/api-storage")
vi.mock("@/lib/storage/local-storage")

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
      getTestSuites: vi.fn(),
      saveTestSuite: vi.fn(),
      deleteTestSuite: vi.fn(),
      getTestSuiteById: vi.fn(),
      initialize: vi.fn(),
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
      getTestSuites: vi.fn(),
      saveTestSuite: vi.fn(),
      deleteTestSuite: vi.fn(),
      getTestSuiteById: vi.fn(),
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
      const mockExecutor = { id: "1", name: "Test Executor", image: "test", createdAt: "2023-01-01" }
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
      const mockExecutor = { id: "1", name: "Test Executor", image: "test", createdAt: "2023-01-01" }
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
    it("should handle getTestSuites with fallback", async () => {
      const mockSuites = [{ id: "1", name: "Test Suite", description: "", testDefinitionIds: [], executionMode: "sequential" as const, createdAt: "2023-01-01", labels: [] }]
      apiInstance.getTestSuites.mockRejectedValue(new Error("Network Error"))
      localInstance.getTestSuites.mockResolvedValue(mockSuites)

      const result = await service.getTestSuites()

      expect(apiInstance.getTestSuites).toHaveBeenCalled()
      expect(localInstance.getTestSuites).toHaveBeenCalled()
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
})
