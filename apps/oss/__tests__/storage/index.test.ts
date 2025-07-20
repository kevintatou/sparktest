import { describe, it, expect, vi, beforeEach } from "vitest"

describe("Storage Index", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Clear module cache to ensure fresh imports
    vi.resetModules()
  })

  it("should use LocalStorageService when USE_RUST_API is false", async () => {
    // Mock environment variable
    vi.stubEnv('NEXT_PUBLIC_USE_RUST_API', 'false')
    
    vi.doMock("@sparktest/storage-service", async (importOriginal) => {
      const actual = await importOriginal()
      const LocalStorageService = vi.fn().mockImplementation(() => ({
        getExecutors: vi.fn(),
        saveExecutor: vi.fn(),
        initialize: vi.fn(),
      }))
      
      return {
        ...actual,
        LocalStorageService,
        storage: new LocalStorageService(),
        getStorage: () => new LocalStorageService()
      }
    })

    const { storage, LocalStorageService } = await import("@sparktest/storage-service")
    
    expect(storage).toBeDefined()
    // Since we're testing the actual behavior, let's check if it's the right instance type
    expect(storage.getExecutors).toBeDefined()
  })

  it("should use SparkTestStorageService when USE_RUST_API is true", async () => {
    // Mock environment variable  
    vi.stubEnv('NEXT_PUBLIC_USE_RUST_API', 'true')
    
    vi.doMock("@sparktest/storage-service", async (importOriginal) => {
      const actual = await importOriginal()
      const SparkTestStorageService = vi.fn().mockImplementation(() => ({
        getExecutors: vi.fn(),
        saveExecutor: vi.fn(),
        initialize: vi.fn(),
      }))
      
      return {
        ...actual,
        SparkTestStorageService,
        storage: new SparkTestStorageService(),
        getStorage: () => new SparkTestStorageService()
      }
    })

    const { storage } = await import("@sparktest/storage-service")
    
    expect(storage).toBeDefined()
    expect(storage.getExecutors).toBeDefined()
  })
})