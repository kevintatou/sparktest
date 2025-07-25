import { describe, it, expect, beforeEach, vi } from "vitest"
import {
  GenericLocalStorageService,
  GenericApiStorageService,
  GenericHybridStorageService,
  storageUtils,
} from "@tatou/storage-service/generic"

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

// Test data types
interface TestItem {
  id: string
  name: string
  value: number
}

const sampleItems: TestItem[] = [
  { id: "1", name: "Item 1", value: 10 },
  { id: "2", name: "Item 2", value: 20 },
]

describe("Generic Storage Services", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock fetch for API tests
    global.fetch = vi.fn()
  })

  describe("GenericLocalStorageService", () => {
    let service: GenericLocalStorageService<TestItem>

    beforeEach(() => {
      service = new GenericLocalStorageService<TestItem>(
        "test_items",
        sampleItems,
        (item) => item.id,
        storageUtils
      )
    })

    it("should get items from localStorage", async () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify(sampleItems))

      const result = await service.getItems()
      expect(result).toEqual(sampleItems)
      expect(localStorageMock.getItem).toHaveBeenCalledWith("test_items")
    })

    it("should return default items when localStorage is empty", async () => {
      localStorageMock.getItem.mockReturnValue(null)

      const result = await service.getItems()
      expect(result).toEqual(sampleItems)
    })

    it("should save new item", async () => {
      const newItem: TestItem = { id: "3", name: "Item 3", value: 30 }
      localStorageMock.getItem.mockReturnValue(JSON.stringify(sampleItems))

      await service.saveItem(newItem)

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "test_items",
        JSON.stringify([...sampleItems, newItem])
      )
    })

    it("should update existing item", async () => {
      const updatedItem: TestItem = { id: "1", name: "Updated Item 1", value: 100 }
      localStorageMock.getItem.mockReturnValue(JSON.stringify(sampleItems))

      await service.saveItem(updatedItem)

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "test_items",
        JSON.stringify([updatedItem, sampleItems[1]])
      )
    })

    it("should delete item by id", async () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify(sampleItems))

      const result = await service.deleteItem("1")

      expect(result).toBe(true)
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "test_items",
        JSON.stringify([sampleItems[1]])
      )
    })

    it("should get item by id", async () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify(sampleItems))

      const result = await service.getItemById("2")
      expect(result).toEqual(sampleItems[1])
    })

    it("should return undefined for non-existent id", async () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify(sampleItems))

      const result = await service.getItemById("999")
      expect(result).toBeUndefined()
    })

    it("should initialize storage with defaults", async () => {
      localStorageMock.getItem.mockReturnValue(null)

      await service.initialize()

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "test_items",
        JSON.stringify(sampleItems)
      )
    })

    it("should respect insert mode 'unshift'", async () => {
      const unshiftService = new GenericLocalStorageService<TestItem>(
        "test_items",
        sampleItems,
        (item) => item.id,
        storageUtils,
        { insertMode: "unshift" }
      )

      const newItem: TestItem = { id: "3", name: "Item 3", value: 30 }
      localStorageMock.getItem.mockReturnValue(JSON.stringify(sampleItems))

      await unshiftService.saveItem(newItem)

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "test_items",
        JSON.stringify([newItem, ...sampleItems])
      )
    })

    it("should respect maxItems limit", async () => {
      const limitedService = new GenericLocalStorageService<TestItem>(
        "test_items",
        sampleItems,
        (item) => item.id,
        storageUtils,
        { maxItems: 2 }
      )

      const newItem: TestItem = { id: "3", name: "Item 3", value: 30 }
      localStorageMock.getItem.mockReturnValue(JSON.stringify(sampleItems))

      await limitedService.saveItem(newItem)

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "test_items",
        JSON.stringify([sampleItems[0], sampleItems[1]]) // Limited to 2 items
      )
    })
  })

  describe("GenericApiStorageService", () => {
    let service: GenericApiStorageService<TestItem>

    beforeEach(() => {
      service = new GenericApiStorageService<TestItem>(
        "test-items",
        "http://localhost:3000/api",
        (item) => item.id
      )
    })

    it("should get items from API", async () => {
      const mockFetch = global.fetch as any
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => sampleItems,
      })

      const result = await service.getItems()

      expect(result).toEqual(sampleItems)
      expect(mockFetch).toHaveBeenCalledWith("http://localhost:3000/api/test-items")
    })

    it("should handle API errors in getItems", async () => {
      const mockFetch = global.fetch as any
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      })

      await expect(service.getItems()).rejects.toThrow("Failed to fetch test-items")
    })

    it("should save new item via API", async () => {
      const newItem: TestItem = { id: "", name: "New Item", value: 40 }
      const mockFetch = global.fetch as any
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...newItem, id: "3" }),
      })

      const result = await service.saveItem(newItem)

      expect(result).toEqual({ ...newItem, id: "3" })
      expect(mockFetch).toHaveBeenCalledWith("http://localhost:3000/api/test-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
      })
    })

    it("should update existing item via API", async () => {
      const updatedItem: TestItem = { id: "1", name: "Updated Item", value: 100 }
      const mockFetch = global.fetch as any
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => updatedItem,
      })

      const result = await service.saveItem(updatedItem)

      expect(result).toEqual(updatedItem)
      expect(mockFetch).toHaveBeenCalledWith("http://localhost:3000/api/test-items/1", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedItem),
      })
    })

    it("should delete item via API", async () => {
      const mockFetch = global.fetch as any
      mockFetch.mockResolvedValueOnce({
        ok: true,
      })

      const result = await service.deleteItem("1")

      expect(result).toBe(true)
      expect(mockFetch).toHaveBeenCalledWith("http://localhost:3000/api/test-items/1", {
        method: "DELETE",
      })
    })
  })

  describe("GenericHybridStorageService", () => {
    let apiService: GenericApiStorageService<TestItem>
    let localService: GenericLocalStorageService<TestItem>
    let hybridService: GenericHybridStorageService<TestItem>

    beforeEach(() => {
      apiService = new GenericApiStorageService<TestItem>(
        "test-items",
        "http://localhost:3000/api",
        (item) => item.id
      )
      localService = new GenericLocalStorageService<TestItem>(
        "test_items",
        sampleItems,
        (item) => item.id,
        storageUtils
      )
      hybridService = new GenericHybridStorageService<TestItem>(apiService, localService)
    })

    it("should use API service when available", async () => {
      const mockFetch = global.fetch as any
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => sampleItems,
      })

      const result = await hybridService.getItems()

      expect(result).toEqual(sampleItems)
      expect(mockFetch).toHaveBeenCalledWith("http://localhost:3000/api/test-items")
    })

    it("should fallback to local storage when API fails", async () => {
      const mockFetch = global.fetch as any
      mockFetch.mockRejectedValueOnce(new Error("Network error"))
      localStorageMock.getItem.mockReturnValue(JSON.stringify(sampleItems))

      const result = await hybridService.getItems()

      expect(result).toEqual(sampleItems)
      expect(localStorageMock.getItem).toHaveBeenCalledWith("test_items")
    })

    it("should call onFallback callback when API fails", async () => {
      const onFallback = vi.fn()
      const hybridWithCallback = new GenericHybridStorageService<TestItem>(
        apiService,
        localService,
        { onFallback }
      )

      const mockFetch = global.fetch as any
      mockFetch.mockRejectedValueOnce(new Error("Network error"))
      localStorageMock.getItem.mockReturnValue(JSON.stringify(sampleItems))

      await hybridWithCallback.getItems()

      expect(onFallback).toHaveBeenCalledWith("Network error")
    })

    it("should initialize both services", async () => {
      vi.spyOn(apiService, "initialize")
      vi.spyOn(localService, "initialize")
      localStorageMock.getItem.mockReturnValue(null)

      await hybridService.initialize()

      expect(apiService.initialize).toHaveBeenCalled()
      expect(localService.initialize).toHaveBeenCalled()
    })
  })
})
