import { describe, it, expect, beforeEach, vi } from "vitest"
import { LocalStorageService } from "@/lib/storage/local-storage"

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
        createdAt: new Date().toISOString()
      }
      localStorageMock.getItem.mockReturnValue("[]")

      await service.saveExecutor(mockExecutor)

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "sparktest_executors",
        expect.stringContaining(mockExecutor.name),
      )
    })
  })
})
