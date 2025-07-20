import { describe, it, expect, vi } from "vitest"
import { ApiStorageService } from "@sparktest/storage-service/api-storage"

// Test the executor selection in test definition creation
describe("Executor Selection in Test Definition", () => {
  it("should include executorId when saving test definition", async () => {
    // Mock fetch to simulate the backend response
    const mockFetch = vi.fn()
    global.fetch = mockFetch

    // Simulate form data with executor selection
    const formDataWithExecutor = {
      name: "Test with Executor",
      description: "Test created with executor selection",
      image: "node:18",
      commands: ["npm", "test"],
      executorId: "executor-uuid-123",
      createdAt: new Date().toISOString()
    }

    // Simulate backend response
    const backendResponse = {
      id: "test-def-uuid",
      name: "Test with Executor",
      description: "Test created with executor selection",
      image: "node:18", 
      commands: ["npm", "test"],
      executor_id: "executor-uuid-123",
      created_at: "2024-01-15T10:30:00Z"
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(backendResponse),
    })

    const service = new ApiStorageService()
    const result = await service.saveDefinition(formDataWithExecutor as any)

    // Verify the request was made correctly with executorId
    expect(mockFetch).toHaveBeenCalledWith("http://localhost:3001/api/test-definitions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formDataWithExecutor), // Should include executorId
    })

    // Verify the response includes the executor_id
    expect(result).toMatchObject({
      id: "test-def-uuid",
      name: "Test with Executor",
      executor_id: "executor-uuid-123"
    })
  })

  it("should handle test definition without executor selection", async () => {
    const mockFetch = vi.fn()
    global.fetch = mockFetch

    // Form data without executor (executorId empty or undefined)
    const formDataWithoutExecutor = {
      name: "Custom Test",
      description: "Test without executor",
      image: "ubuntu:latest",
      commands: ["echo", "hello"],
      executorId: "", // Empty string means no executor selected
      createdAt: new Date().toISOString()
    }

    const backendResponse = {
      id: "custom-test-uuid",
      name: "Custom Test",
      description: "Test without executor",
      image: "ubuntu:latest",
      commands: ["echo", "hello"],
      executor_id: null, // Backend returns null for no executor
      created_at: "2024-01-15T10:30:00Z"
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(backendResponse),
    })

    const service = new ApiStorageService()
    const result = await service.saveDefinition(formDataWithoutExecutor as any)

    expect(result.executor_id).toBeNull()
    expect(result.name).toBe("Custom Test")
  })
})