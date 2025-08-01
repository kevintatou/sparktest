import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock the config
vi.mock("@tatou/core/config", () => ({
  USE_RUST_API: false,
}))

vi.mock("@tatou/storage-service/local-storage", () => ({
  LocalStorageService: vi.fn().mockImplementation(() => ({
    getExecutors: vi.fn(),
    saveExecutor: vi.fn(),
  })),
}))

vi.mock("@tatou/storage-service/api-storage", () => ({
  ApiStorageService: vi.fn().mockImplementation(() => ({
    getExecutors: vi.fn(),
    saveExecutor: vi.fn(),
  })),
}))

describe("Storage Index", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Clear module cache to ensure fresh imports
    vi.resetModules()
  })

  it("should use LocalStorageService when USE_RUST_API is false", async () => {
    vi.doMock("@tatou/core/config", () => ({
      USE_RUST_API: false,
    }))

    const { storage } = await import("@tatou/storage-service")
    const { LocalStorageService } = await import("@tatou/storage-service/local-storage")

    expect(LocalStorageService).toHaveBeenCalled()
    expect(storage).toBeDefined()
  })

  it("should use ApiStorageService when USE_RUST_API is true", async () => {
    vi.doMock("@tatou/core/config", () => ({
      USE_RUST_API: true,
    }))

    const { storage } = await import("@tatou/storage-service")
    const { SparkTestStorageService } = await import("@tatou/storage-service/sparktest-storage")

    expect(storage).toBeInstanceOf(SparkTestStorageService)
    expect(storage).toBeDefined()
  })
})
