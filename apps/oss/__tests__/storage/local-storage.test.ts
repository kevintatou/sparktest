import { describe, it, expect, beforeEach, vi } from "vitest"
import { LocalStorageService } from "@tatou/storage-service/local-storage"

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

describe("LocalStorageService", () => {
  let service: LocalStorageService

  beforeEach(() => {
    service = new LocalStorageService()
    vi.clearAllMocks()
  })

  describe("getExecutors", () => {
    it("should return executors from localStorage", async () => {
      const mockExecutors = [{ id: "1", name: "Test Executor" }]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockExecutors))

      const result = await service.getExecutors()
      expect(result).toEqual(mockExecutors)
    })

    it("should return sample data when localStorage is empty", async () => {
      localStorageMock.getItem.mockReturnValue(null)

      const result = await service.getExecutors()
      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe("saveExecutor", () => {
    it("should save executor to localStorage", async () => {
      const mockExecutor = {
        id: "1",
        name: "Test Executor",
        image: "test:latest",
        createdAt: new Date().toISOString(),
      }
      localStorageMock.getItem.mockReturnValue("[]")

      await service.saveExecutor(mockExecutor)

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "sparktest_executors",
        expect.stringContaining(mockExecutor.name)
      )
    })

    it("should update existing executor", async () => {
      const existingExecutor = {
        id: "1",
        name: "Old Executor",
        image: "old:latest",
        createdAt: new Date().toISOString(),
      }
      const updatedExecutor = {
        id: "1",
        name: "Updated Executor",
        image: "new:latest",
        createdAt: new Date().toISOString(),
      }
      localStorageMock.getItem.mockReturnValue(JSON.stringify([existingExecutor]))

      await service.saveExecutor(updatedExecutor)

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "sparktest_executors",
        expect.stringContaining(updatedExecutor.name)
      )
    })
  })

  describe("deleteExecutor", () => {
    it("should remove executor from localStorage", async () => {
      const executors = [
        { id: "1", name: "Executor 1", image: "test1:latest", createdAt: new Date().toISOString() },
        { id: "2", name: "Executor 2", image: "test2:latest", createdAt: new Date().toISOString() },
      ]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(executors))

      const result = await service.deleteExecutor("1")

      expect(result).toBe(true)
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "sparktest_executors",
        expect.not.stringContaining("Executor 1")
      )
    })
  })

  describe("getExecutorById", () => {
    it("should return specific executor by id", async () => {
      const executors = [
        { id: "1", name: "Executor 1", image: "test1:latest", createdAt: new Date().toISOString() },
        { id: "2", name: "Executor 2", image: "test2:latest", createdAt: new Date().toISOString() },
      ]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(executors))

      const result = await service.getExecutorById("2")

      expect(result).toEqual(executors[1])
    })

    it("should return undefined for non-existent id", async () => {
      localStorageMock.getItem.mockReturnValue("[]")

      const result = await service.getExecutorById("999")

      expect(result).toBeUndefined()
    })
  })

  describe("definitions", () => {
    describe("getDefinitions", () => {
      it("should return definitions from localStorage", async () => {
        const mockDefinitions = [{ id: "1", name: "Test Definition" }]
        localStorageMock.getItem.mockReturnValue(JSON.stringify(mockDefinitions))

        const result = await service.getDefinitions()
        expect(result).toEqual(mockDefinitions)
      })

      it("should return sample data when localStorage is empty", async () => {
        localStorageMock.getItem.mockReturnValue(null)

        const result = await service.getDefinitions()
        expect(Array.isArray(result)).toBe(true)
      })
    })

    describe("saveDefinition", () => {
      it("should save definition to localStorage", async () => {
        const mockDefinition = {
          id: "1",
          name: "Test Definition",
          description: "Test desc",
          image: "test:latest",
          commands: ["echo", "hello"],
          createdAt: new Date().toISOString(),
        }
        localStorageMock.getItem.mockReturnValue("[]")

        await service.saveDefinition(mockDefinition)

        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          "sparktest_definitions",
          expect.stringContaining(mockDefinition.name)
        )
      })
    })

    describe("deleteDefinition", () => {
      it("should remove definition from localStorage", async () => {
        const definitions = [
          {
            id: "1",
            name: "Definition 1",
            description: "desc1",
            image: "test1:latest",
            commands: ["echo"],
            createdAt: new Date().toISOString(),
          },
        ]
        localStorageMock.getItem.mockReturnValue(JSON.stringify(definitions))

        const result = await service.deleteDefinition("1")

        expect(result).toBe(true)
      })
    })

    describe("getDefinitionById", () => {
      it("should return specific definition by id", async () => {
        const definitions = [
          {
            id: "1",
            name: "Definition 1",
            description: "desc1",
            image: "test1:latest",
            commands: ["echo"],
            createdAt: new Date().toISOString(),
          },
        ]
        localStorageMock.getItem.mockReturnValue(JSON.stringify(definitions))

        const result = await service.getDefinitionById("1")

        expect(result).toEqual(definitions[0])
      })
    })
  })

  describe("runs", () => {
    describe("getRuns", () => {
      it("should return runs from localStorage", async () => {
        const mockRuns = [{ id: "1", name: "Test Run", status: "running" }]
        localStorageMock.getItem.mockReturnValue(JSON.stringify(mockRuns))

        const result = await service.getRuns()
        expect(result).toEqual(mockRuns)
      })
    })

    describe("getRunById", () => {
      it("should return specific run by id", async () => {
        const runs = [
          {
            id: "1",
            name: "Run 1",
            image: "test1:latest",
            command: ["echo"],
            status: "running",
            createdAt: new Date().toISOString(),
          },
        ]
        localStorageMock.getItem.mockReturnValue(JSON.stringify(runs))

        const result = await service.getRunById("1")

        expect(result).toEqual(runs[0])
      })
    })

    describe("deleteRun", () => {
      it("should remove run from localStorage", async () => {
        const runs = [
          {
            id: "1",
            name: "Run 1",
            image: "test1:latest",
            command: ["echo"],
            status: "running",
            createdAt: new Date().toISOString(),
          },
        ]
        localStorageMock.getItem.mockReturnValue(JSON.stringify(runs))

        const result = await service.deleteRun("1")

        expect(result).toBe(true)
      })
    })

    describe("createRun", () => {
      it("should create new run from definition", async () => {
        const definitions = [
          {
            id: "def1",
            name: "Definition 1",
            description: "desc1",
            image: "test1:latest",
            commands: ["echo", "hello"],
            createdAt: new Date().toISOString(),
          },
        ]
        localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(definitions)) // getDefinitions
        localStorageMock.getItem.mockReturnValueOnce("[]") // getRuns

        const result = await service.createRun("def1", { name: "Custom Run" })

        expect(result.name).toBe("Custom Run")
        expect(result.status).toBe("running")
        expect(result.definitionId).toBe("def1")
      })
    })
  })

  describe("initialize", () => {
    it("should initialize storage without error", () => {
      expect(() => service.initialize()).not.toThrow()
    })
  })
})
