import { describe, it, expect, vi, beforeEach } from "vitest"
import { GET } from "@/app/api/runs/[id]/logs/route"
import { NextRequest } from "next/server"

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

// Constants for backend URL (matches the actual default)
const BACKEND_URL = "http://localhost:8080"

describe("/api/runs/[id]/logs", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("GET", () => {
    it("should reconstruct k8s job name and fetch logs successfully", async () => {
      const runId = "550e8400-e29b-41d4-a716-446655440000"
      const expectedJobName = `test-run-${runId}`
      
      // Mock successful run fetch
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            id: runId,
            name: "Test Run",
            status: "running"
          })
        })
        // Mock successful logs fetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            job_name: expectedJobName,
            pod_name: "test-run-550e8400-e29b-41d4-a716-446655440000-abc123",
            logs: "Starting container...\nExecuting test...\nTest completed successfully",
            timestamp: "2024-01-15T10:30:00Z",
            status: "completed"
          })
        })

      const request = new NextRequest("http://localhost:3000/api/runs/550e8400-e29b-41d4-a716-446655440000/logs")
      const response = await GET(request, { params: { id: runId } })
      const data = await response.json()

      // Verify the correct API calls were made
      expect(mockFetch).toHaveBeenCalledTimes(2)
      
      // Verify run lookup
      expect(mockFetch).toHaveBeenNthCalledWith(1, `${BACKEND_URL}/api/test-runs/550e8400-e29b-41d4-a716-446655440000`)
      
      // Verify logs fetch with reconstructed job name
      expect(mockFetch).toHaveBeenNthCalledWith(2, `${BACKEND_URL}/api/k8s/logs/${expectedJobName}`)

      // Verify response
      expect(response.status).toBe(200)
      expect(data).toEqual({
        job_name: expectedJobName,
        pod_name: "test-run-550e8400-e29b-41d4-a716-446655440000-abc123",
        logs: "Starting container...\nExecuting test...\nTest completed successfully",
        timestamp: "2024-01-15T10:30:00Z",
        status: "completed"
      })
    })

    it("should handle run not found error", async () => {
      const runId = "non-existent-run-id"
      
      // Mock failed run fetch
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: "Not Found"
      })

      const request = new NextRequest(`http://localhost:3000/api/runs/${runId}/logs`)
      const response = await GET(request, { params: { id: runId } })
      const data = await response.json()

      // Verify only run lookup was attempted
      expect(mockFetch).toHaveBeenCalledTimes(1)
      expect(mockFetch).toHaveBeenCalledWith(`${BACKEND_URL}/api/test-runs/${runId}`)

      // Verify error response
      expect(response.status).toBe(500)
      expect(data).toEqual({
        error: "Failed to fetch run logs"
      })
    })

    it("should handle k8s logs not found error", async () => {
      const runId = "550e8400-e29b-41d4-a716-446655440000"
      const expectedJobName = `test-run-${runId}`
      
      // Mock successful run fetch
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            id: runId,
            name: "Test Run",
            status: "running"
          })
        })
        // Mock failed logs fetch (job might not exist in k8s yet)
        .mockResolvedValueOnce({
          ok: false,
          status: 404,
          statusText: "Not Found"
        })

      const request = new NextRequest(`http://localhost:3000/api/runs/${runId}/logs`)
      const response = await GET(request, { params: { id: runId } })
      const data = await response.json()

      // Verify both API calls were made
      expect(mockFetch).toHaveBeenCalledTimes(2)
      expect(mockFetch).toHaveBeenNthCalledWith(1, `${BACKEND_URL}/api/test-runs/${runId}`)
      expect(mockFetch).toHaveBeenNthCalledWith(2, `${BACKEND_URL}/api/k8s/logs/${expectedJobName}`)

      // Verify error response
      expect(response.status).toBe(500)
      expect(data).toEqual({
        error: "Failed to fetch run logs"
      })
    })

    it("should reconstruct job name correctly for different UUID formats", async () => {
      const testCases = [
        "550e8400-e29b-41d4-a716-446655440000", // Standard UUID
        "123e4567-e89b-12d3-a456-426614174000", // Another valid UUID
        "00000000-0000-0000-0000-000000000001", // Edge case UUID
      ]

      for (const runId of testCases) {
        const expectedJobName = `test-run-${runId}`
        
        // Mock successful responses
        mockFetch
          .mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ id: runId, name: "Test Run", status: "running" })
          })
          .mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({
              job_name: expectedJobName,
              pod_name: `${expectedJobName}-pod-123`,
              logs: "Test logs",
              timestamp: "2024-01-15T10:30:00Z",
              status: "running"
            })
          })

        const request = new NextRequest(`http://localhost:3000/api/runs/${runId}/logs`)
        const response = await GET(request, { params: { id: runId } })

        // Verify correct job name reconstruction
        expect(mockFetch).toHaveBeenCalledWith(`${BACKEND_URL}/api/k8s/logs/${expectedJobName}`)
        
        expect(response.status).toBe(200)
        
        // Reset mocks for next iteration
        vi.clearAllMocks()
      }
    })

    it("should handle network errors gracefully", async () => {
      const runId = "550e8400-e29b-41d4-a716-446655440000"
      
      // Mock network error on run fetch
      mockFetch.mockRejectedValueOnce(new Error("Network error"))

      const request = new NextRequest(`http://localhost:3000/api/runs/${runId}/logs`)
      const response = await GET(request, { params: { id: runId } })
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({
        error: "Failed to fetch run logs"
      })
    })

    it("should handle invalid JSON responses", async () => {
      const runId = "550e8400-e29b-41d4-a716-446655440000"
      
      // Mock successful run fetch but invalid JSON
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.reject(new Error("Invalid JSON"))
      })

      const request = new NextRequest(`http://localhost:3000/api/runs/${runId}/logs`)
      const response = await GET(request, { params: { id: runId } })
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({
        error: "Failed to fetch run logs"
      })
    })

    it("should preserve backend error responses in logs data", async () => {
      const runId = "550e8400-e29b-41d4-a716-446655440000"
      const expectedJobName = `test-run-${runId}`
      
      // Mock successful run fetch
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            id: runId,
            name: "Test Run",
            status: "running"
          })
        })
        // Mock logs response with backend error (but still 200 OK)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            job_name: expectedJobName,
            error: "Kubernetes client unavailable",
            timestamp: "2024-01-15T10:30:00Z",
            status: "error"
          })
        })

      const request = new NextRequest(`http://localhost:3000/api/runs/${runId}/logs`)
      const response = await GET(request, { params: { id: runId } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        job_name: expectedJobName,
        error: "Kubernetes client unavailable",
        timestamp: "2024-01-15T10:30:00Z",
        status: "error"
      })
    })

    it("should validate job name reconstruction pattern", async () => {
      const runId = "abc12345-def6-7890-abcd-ef1234567890"
      const expectedJobName = `test-run-${runId}`
      
      // Mock successful responses
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ id: runId, name: "Test Run", status: "running" })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            job_name: expectedJobName,
            pod_name: `${expectedJobName}-pod-xyz`,
            logs: "Job name pattern validation test",
            timestamp: "2024-01-15T10:30:00Z",
            status: "running"
          })
        })

      const request = new NextRequest(`http://localhost:3000/api/runs/${runId}/logs`)
      await GET(request, { params: { id: runId } })

      // Verify the exact pattern used: test-run-{runId}
      expect(mockFetch).toHaveBeenNthCalledWith(2, `${BACKEND_URL}/api/k8s/logs/${expectedJobName}`)
      
      // Ensure no transformation of the UUID (should be passed as-is)
      expect(expectedJobName).toBe(`test-run-${runId}`)
      expect(expectedJobName).not.toContain('_') // No underscores
      expect(expectedJobName).toContain('-') // Contains dashes from UUID
    })
  })
})