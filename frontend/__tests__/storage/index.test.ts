import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock the config
vi.mock("@/lib/config", () => ({
  USE_RUST_API: false,
}))

vi.mock("@/lib/storage/local-storage", () => ({
  LocalStorageService: vi.fn().mockImplementation(() => ({
    getExecutors: vi.fn(),
    saveExecutor: vi.fn(),
  })),
}))

vi.mock("@/lib/storage/sparktest-storage", () => ({
  SparkTestStorageService: vi.fn().mockImplementation(() => ({
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
    vi.doMock("@/lib/config", () => ({
      USE_RUST_API: false,
    }))

    const { storage } = await import("@/lib/storage/index")
    const { LocalStorageService } = await import("@/lib/storage/local-storage")

    expect(LocalStorageService).toHaveBeenCalled()
    expect(storage).toBeDefined()
  })

  it("should use SparkTestStorageService when USE_RUST_API is true", async () => {
    vi.doMock("@/lib/config", () => ({
      USE_RUST_API: true,
    }))

    const { storage } = await import("@/lib/storage/index")
    const { SparkTestStorageService } = await import("@/lib/storage/sparktest-storage")

    expect(SparkTestStorageService).toHaveBeenCalled()
    expect(storage).toBeDefined()
  })
})