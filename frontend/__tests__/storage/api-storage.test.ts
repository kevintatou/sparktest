import { describe, it, expect, beforeEach, vi, afterEach } from "vitest"
import { ApiStorageService } from "@/lib/storage/api-storage"

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

describe("ApiStorageService", () => {
  let service: ApiStorageService

  beforeEach(() => {
    service = new ApiStorageService()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe("getExecutors", () => {
    it("should fetch executors from API", async () => {
      const mockExecutors = [{ id: "1", name: "Test Executor" }]
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockExecutors),
      })

      const result = await service.getExecutors()

      expect(mockFetch).toHaveBeenCalledWith("http://localhost:3001/api/test-executors")
      expect(result).toEqual(mockExecutors)
    })

    it("should throw error when API request fails", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      })

      await expect(service.getExecutors()).rejects.toThrow("Failed to fetch executors")
    })
  })

  describe("saveExecutor", () => {
    it("should save executor via API", async () => {
      const mockExecutor = { 
        id: "1", 
        name: "Test Executor",
        image: "test:latest",
        createdAt: new Date().toISOString()
      }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockExecutor),
      })

      const result = await service.saveExecutor(mockExecutor)

      expect(mockFetch).toHaveBeenCalledWith("http://localhost:3001/api/test-executors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mockExecutor),
      })
      expect(result).toEqual(mockExecutor)
    })

    it("should throw error when save fails", async () => {
      const mockExecutor = { 
        id: "1", 
        name: "Test Executor",
        image: "test:latest",
        createdAt: new Date().toISOString()
      }
      mockFetch.mockResolvedValueOnce({
        ok: false,
      })

      await expect(service.saveExecutor(mockExecutor)).rejects.toThrow("Failed to save executor")
    })
  })

  describe("deleteExecutor", () => {
    it("should delete executor via API", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
      })

      const result = await service.deleteExecutor("1")

      expect(mockFetch).toHaveBeenCalledWith("http://localhost:3001/api/test-executors/1", {
        method: "DELETE"
      })
      expect(result).toBe(true)
    })

    it("should return false when delete fails", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      })

      const result = await service.deleteExecutor("1")

      expect(result).toBe(false)
    })
  })

  describe("getExecutorById", () => {
    it("should return specific executor by id", async () => {
      const executors = [
        { id: "1", name: "Executor 1", image: "test1:latest", createdAt: new Date().toISOString() },
        { id: "2", name: "Executor 2", image: "test2:latest", createdAt: new Date().toISOString() }
      ]
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(executors),
      })

      const result = await service.getExecutorById("2")

      expect(result).toEqual(executors[1])
    })

    it("should return undefined for non-existent id", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      })

      const result = await service.getExecutorById("999")

      expect(result).toBeUndefined()
    })
  })

  describe("definitions", () => {
    describe("getDefinitions", () => {
      it("should fetch definitions from API", async () => {
        const mockDefinitions = [{ id: "1", name: "Test Definition" }]
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockDefinitions),
        })

        const result = await service.getDefinitions()

        expect(mockFetch).toHaveBeenCalledWith("http://localhost:3001/api/test-definitions")
        expect(result).toEqual(mockDefinitions)
      })

      it("should throw error when API request fails", async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
        })

        await expect(service.getDefinitions()).rejects.toThrow("Failed to fetch definitions")
      })
    })

    describe("saveDefinition", () => {
      it("should save definition via API", async () => {
        const mockDefinition = { 
          id: "1", 
          name: "Test Definition",
          description: "Test desc",
          image: "test:latest",
          commands: ["echo", "hello"],
          createdAt: new Date().toISOString()
        }
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockDefinition),
        })

        const result = await service.saveDefinition(mockDefinition)

        expect(mockFetch).toHaveBeenCalledWith("http://localhost:3001/api/test-definitions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(mockDefinition),
        })
        expect(result).toEqual(mockDefinition)
      })
    })

    describe("deleteDefinition", () => {
      it("should delete definition via API", async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
        })

        const result = await service.deleteDefinition("1")

        expect(result).toBe(true)
      })
    })

    describe("getDefinitionById", () => {
      it("should return specific definition by id", async () => {
        const definitions = [
          { id: "1", name: "Definition 1", description: "desc1", image: "test1:latest", commands: ["echo"], createdAt: new Date().toISOString() }
        ]
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(definitions),
        })

        const result = await service.getDefinitionById("1")

        expect(result).toEqual(definitions[0])
      })
    })
  })

  describe("runs", () => {
    describe("getRuns", () => {
      it("should fetch runs from API", async () => {
        const mockRuns = [{ id: "1", name: "Test Run", status: "running" }]
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockRuns),
        })

        const result = await service.getRuns()

        expect(mockFetch).toHaveBeenCalledWith("http://localhost:3001/api/test-runs")
        expect(result).toEqual(mockRuns)
      })

      it("should throw error when API request fails", async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
        })

        await expect(service.getRuns()).rejects.toThrow("Failed to fetch runs")
      })
    })

    describe("getRunById", () => {
      it("should return specific run by id", async () => {
        const runs = [
          { id: "1", name: "Run 1", image: "test1:latest", command: ["echo"], status: "running", createdAt: new Date().toISOString() }
        ]
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(runs),
        })

        const result = await service.getRunById("1")

        expect(result).toEqual(runs[0])
      })
    })

    describe("deleteRun", () => {
      it("should delete run via API", async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
        })

        const result = await service.deleteRun("1")

        expect(result).toBe(true)
      })
    })

    describe("createRun", () => {
      it("should create new run via API", async () => {
        const mockRun = {
          id: "1", 
          name: "Test Run",
          image: "test:latest", 
          command: ["echo"], 
          status: "running", 
          createdAt: new Date().toISOString()
        }
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockRun),
        })

        const result = await service.createRun("def1", { name: "Custom Run" })

        expect(mockFetch).toHaveBeenCalledWith("http://localhost:3001/api/test-runs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            test_definition_id: "def1",
            name: "Custom Run"
          }),
        })
        expect(result).toEqual(mockRun)
      })

      it("should throw error when create fails", async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
        })

        await expect(service.createRun("def1")).rejects.toThrow("Failed to create test run")
      })
    })
  })

  describe("subscribeToRuns", () => {
    it("should return an unsubscribe function", () => {
      const callback = vi.fn()
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
      })

      const unsubscribe = service.subscribeToRuns(callback)

      expect(typeof unsubscribe).toBe("function")
      unsubscribe()
    })

    it("should handle subscription setup without errors", () => {
      const callback = vi.fn()
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
      })

      expect(() => {
        const unsubscribe = service.subscribeToRuns(callback)
        unsubscribe()
      }).not.toThrow()
    })
  })

  describe("initialize", () => {
    it("should be a no-op for API mode", () => {
      expect(() => service.initialize()).not.toThrow()
    })
  })
})