import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock the config
vi.mock("@sparktest/storage/config", () => ({
  USE_RUST_API: false,
}))

vi.mock("@sparktest/storage/local-storage", () => ({
  LocalStorageService: vi.fn().mockImplementation(() => ({
    getExecutors: vi.fn(),
    saveExecutor: vi.fn(),
  })),
}))

vi.mock("@sparktest/storage/hybrid-storage", () => ({
  HybridStorageService: vi.fn().mockImplementation(() => ({
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
    vi.doMock("@sparktest/storage/config", () => ({
      USE_RUST_API: false,
    }))

    const { storage } = await import("@sparktest/storage/index")
    const { LocalStorageService } = await import("@sparktest/storage/local-storage")

    expect(LocalStorageService).toHaveBeenCalled()
    expect(storage).toBeDefined()
  })

  it("should use HybridStorageService when USE_RUST_API is true", async () => {
    vi.doMock("@sparktest/storage/config", () => ({
      USE_RUST_API: true,
    }))

    const { storage } = await import("@sparktest/storage/index")
    const { HybridStorageService } = await import("@sparktest/storage/hybrid-storage")

    expect(HybridStorageService).toHaveBeenCalled()
    expect(storage).toBeDefined()
  })
})