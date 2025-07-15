import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock the config
vi.mock("@sparktest/core/config", () => ({
  USE_RUST_API: false,
}))

vi.mock("@sparktest/core/storage/local-storage", () => ({
  LocalStorageService: vi.fn().mockImplementation(() => ({
    getExecutors: vi.fn(),
    saveExecutor: vi.fn(),
  })),
}))

vi.mock("@sparktest/core/storage/api-storage", () => ({
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
    vi.doMock("@sparktest/core/config", () => ({
      USE_RUST_API: false,
    }))

    const { storage } = await import("@sparktest/core/storage/index")
    const { LocalStorageService } = await import("@sparktest/core/storage/local-storage")

    expect(LocalStorageService).toHaveBeenCalled()
    expect(storage).toBeDefined()
  })

  it("should use ApiStorageService when USE_RUST_API is true", async () => {
    vi.doMock("@sparktest/core/config", () => ({
      USE_RUST_API: true,
    }))

    const { storage } = await import("@sparktest/core/storage/index")
    const { ApiStorageService } = await import("@sparktest/core/storage/api-storage")

    expect(ApiStorageService).toHaveBeenCalled()
    expect(storage).toBeDefined()
  })
})