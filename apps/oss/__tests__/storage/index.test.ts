import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock the config
vi.mock("@sparktest/core", () => ({
  USE_RUST_API: false,
}))

vi.mock("@sparktest/storage-service", () => ({
  LocalStorageService: vi.fn().mockImplementation(() => ({
    getExecutors: vi.fn(),
    saveExecutor: vi.fn(),
  })),
}))

vi.mock("@sparktest/storage-service", () => ({
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
    vi.doMock("@sparktest/core", () => ({
      USE_RUST_API: false,
    }))

    const { storage } = await import("@sparktest/storage-service")
    const { LocalStorageService } = await import("@sparktest/storage-service")

    expect(LocalStorageService).toHaveBeenCalled()
    expect(storage).toBeDefined()
  })

  it("should use ApiStorageService when USE_RUST_API is true", async () => {
    vi.doMock("@sparktest/core", () => ({
      USE_RUST_API: true,
    }))

    const { storage } = await import("@sparktest/storage-service")
    const { ApiStorageService } = await import("@sparktest/storage-service")

    expect(ApiStorageService).toHaveBeenCalled()
    expect(storage).toBeDefined()
  })
})