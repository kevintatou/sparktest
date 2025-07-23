import { describe, it, expect, vi } from "vitest"
import { POST } from "@/app/api/run-test/route"

// Mock uuid
vi.mock("uuid", () => ({
  v4: () => "mock-uuid-123",
}))

describe("/api/run-test", () => {
  describe("POST", () => {
    it("should create a test run with valid input", async () => {
      const mockRequest = {
        json: () =>
          Promise.resolve({
            name: "Test Job",
            image: "nginx:latest",
            command: ["echo", "hello"],
            testDefinitionId: "def-123",
          }),
      } as Request

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data).toMatchObject({
        id: "mock-uuid-123",
        name: "Test Job",
        image: "nginx:latest",
        command: ["echo", "hello"],
        status: "running",
        testDefinitionId: "def-123",
      })
      expect(data.createdAt).toBeDefined()
    })

    it("should create a test run without testDefinitionId", async () => {
      const mockRequest = {
        json: () =>
          Promise.resolve({
            name: "Simple Job",
            image: "ubuntu:latest",
            command: ["ls", "-la"],
          }),
      } as Request

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data).toMatchObject({
        id: "mock-uuid-123",
        name: "Simple Job",
        image: "ubuntu:latest",
        command: ["ls", "-la"],
        status: "running",
      })
      expect(data.testDefinitionId).toBeUndefined()
    })

    it("should return 400 when name is missing", async () => {
      const mockRequest = {
        json: () =>
          Promise.resolve({
            image: "nginx:latest",
            command: ["echo", "hello"],
          }),
      } as Request

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain("Missing required fields")
    })

    it("should return 400 when image is missing", async () => {
      const mockRequest = {
        json: () =>
          Promise.resolve({
            name: "Test Job",
            command: ["echo", "hello"],
          }),
      } as Request

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain("Missing required fields")
    })

    it("should return 400 when command is missing", async () => {
      const mockRequest = {
        json: () =>
          Promise.resolve({
            name: "Test Job",
            image: "nginx:latest",
          }),
      } as Request

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain("Missing required fields")
    })

    it("should return 400 when command is not an array", async () => {
      const mockRequest = {
        json: () =>
          Promise.resolve({
            name: "Test Job",
            image: "nginx:latest",
            command: "echo hello",
          }),
      } as Request

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain("Missing required fields")
    })

    it("should return 400 when command is empty array", async () => {
      const mockRequest = {
        json: () =>
          Promise.resolve({
            name: "Test Job",
            image: "nginx:latest",
            command: [],
          }),
      } as Request

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain("Missing required fields")
    })

    it("should return 500 when JSON parsing fails", async () => {
      const mockRequest = {
        json: () => Promise.reject(new Error("Invalid JSON")),
      } as Request

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe("Internal server error")
    })
  })
})
