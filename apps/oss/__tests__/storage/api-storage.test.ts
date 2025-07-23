import { describe, it, expect, beforeEach, vi, afterEach } from "vitest"
import { ApiStorageService } from "@sparktest/storage-service/api-storage"

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

describe("ApiStorageService", () => {
  let service: ApiStorageService

  beforeEach(() => {
    service = new ApiStorageService()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe("getExecutors", () => {
    it("should fetch executors from API", async () => {
      const mockExecutors = [{ id: "1", name: "Test Executor" }]
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockExecutors),
      })

      const result = await service.getExecutors()

      expect(mockFetch).toHaveBeenCalledWith("http://localhost:3001/api/test-executors")
      expect(result).toEqual(mockExecutors)
    })

    it("should throw error when API request fails", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      })

      await expect(service.getExecutors()).rejects.toThrow("Failed to fetch executors")
    })
  })

  describe("saveExecutor", () => {
    it("should save executor via API", async () => {
      const mockExecutor = {
        id: "1",
        name: "Test Executor",
        image: "test:latest",
        createdAt: new Date().toISOString(),
      }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockExecutor),
      })

      const result = await service.saveExecutor(mockExecutor)

      expect(mockFetch).toHaveBeenCalledWith("http://localhost:3001/api/test-executors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mockExecutor),
      })
      expect(result).toEqual(mockExecutor)
    })

    it("should throw error when save fails", async () => {
      const mockExecutor = {
        id: "1",
        name: "Test Executor",
        image: "test:latest",
        createdAt: new Date().toISOString(),
      }
      mockFetch.mockResolvedValueOnce({
        ok: false,
      })

      await expect(service.saveExecutor(mockExecutor)).rejects.toThrow("Failed to save executor")
    })
  })

  describe("deleteExecutor", () => {
    it("should delete executor via API", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
      })

      const result = await service.deleteExecutor("1")

      expect(mockFetch).toHaveBeenCalledWith("http://localhost:3001/api/test-executors/1", {
        method: "DELETE",
      })
      expect(result).toBe(true)
    })

    it("should return false when delete fails", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      })

      const result = await service.deleteExecutor("1")

      expect(result).toBe(false)
    })
  })

  describe("getExecutorById", () => {
    it("should return specific executor by id", async () => {
      const executors = [
        { id: "1", name: "Executor 1", image: "test1:latest", createdAt: new Date().toISOString() },
        { id: "2", name: "Executor 2", image: "test2:latest", createdAt: new Date().toISOString() },
      ]
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(executors),
      })

      const result = await service.getExecutorById("2")

      expect(result).toEqual(executors[1])
    })

    it("should return undefined for non-existent id", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      })

      const result = await service.getExecutorById("999")

      expect(result).toBeUndefined()
    })
  })

  describe("definitions", () => {
    describe("getDefinitions", () => {
      it("should fetch definitions from API", async () => {
        const mockDefinitions = [{ id: "1", name: "Test Definition" }]
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockDefinitions),
        })

        const result = await service.getDefinitions()

        expect(mockFetch).toHaveBeenCalledWith("http://localhost:3001/api/test-definitions")
        expect(result).toEqual(mockDefinitions)
      })

      it("should throw error when API request fails", async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
        })

        await expect(service.getDefinitions()).rejects.toThrow("Failed to fetch definitions")
      })
    })

    describe("saveDefinition", () => {
      it("should save definition via API", async () => {
        const mockDefinition = {
          id: "1",
          name: "Test Definition",
          description: "Test desc",
          image: "test:latest",
          commands: ["echo", "hello"],
          createdAt: new Date().toISOString(),
        }
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockDefinition),
        })

        const result = await service.saveDefinition(mockDefinition)

        expect(mockFetch).toHaveBeenCalledWith("http://localhost:3001/api/test-definitions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(mockDefinition),
        })
        expect(result).toEqual(mockDefinition)
      })

      it("should save definition without ID and receive generated ID from backend", async () => {
        // What frontend sends (no id)
        const frontendDefinition = {
          name: "Test Definition",
          description: "Test desc",
          image: "test:latest",
          commands: ["echo", "hello"],
          createdAt: new Date().toISOString(),
        }

        // What backend returns (with generated id)
        const backendResponse = {
          id: "generated-uuid-123",
          name: "Test Definition",
          description: "Test desc",
          image: "test:latest",
          commands: ["echo", "hello"],
          created_at: new Date().toISOString(),
        }

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(backendResponse),
        })

        const result = await service.saveDefinition(frontendDefinition as any)

        expect(mockFetch).toHaveBeenCalledWith("http://localhost:3001/api/test-definitions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(frontendDefinition),
        })
        expect(result).toEqual({
          id: "generated-uuid-123",
          name: "Test Definition",
          description: "Test desc",
          image: "test:latest",
          commands: ["echo", "hello"],
          createdAt: backendResponse.created_at,
          executorId: undefined,
          variables: undefined,
          labels: undefined,
          source: undefined,
        })
        expect(result.id).toBe("generated-uuid-123") // Verify ID was generated
      })

      it("should handle 422 error gracefully", async () => {
        const mockDefinition = {
          name: "Test Definition",
          description: "Test desc",
          image: "test:latest",
          commands: ["echo", "hello"],
          createdAt: new Date().toISOString(),
        }

        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 422,
        })

        await expect(service.saveDefinition(mockDefinition as any)).rejects.toThrow(
          "Failed to save definition"
        )
      })
    })

    describe("deleteDefinition", () => {
      it("should delete definition via API", async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
        })

        const result = await service.deleteDefinition("1")

        expect(result).toBe(true)
      })
    })

    describe("getDefinitionById", () => {
      it("should return specific definition by id", async () => {
        const definitions = [
          {
            id: "1",
            name: "Definition 1",
            description: "desc1",
            image: "test1:latest",
            commands: ["echo"],
            createdAt: new Date().toISOString(),
          },
        ]
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(definitions),
        })

        const result = await service.getDefinitionById("1")

        expect(result).toEqual(definitions[0])
      })
    })
  })

  describe("runs", () => {
    describe("getRuns", () => {
      it("should fetch runs from API", async () => {
        const mockRuns = [
          { id: "1", name: "Test Run", status: "running", created_at: "2025-07-07T08:20:00.000Z" },
        ]
        const expectedRuns = [
          { id: "1", name: "Test Run", status: "running", createdAt: "2025-07-07T08:20:00.000Z" },
        ]
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockRuns),
        })

        const result = await service.getRuns()

        expect(mockFetch).toHaveBeenCalledWith("http://localhost:3001/api/test-runs")
        expect(result).toEqual(expectedRuns)
      })

      it("should throw error when API request fails", async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
        })

        await expect(service.getRuns()).rejects.toThrow("Failed to fetch runs")
      })
    })

    describe("getRunById", () => {
      it("should return specific run by id", async () => {
        const runs = [
          {
            id: "1",
            name: "Run 1",
            image: "test1:latest",
            command: ["echo"],
            status: "running",
            created_at: "2025-07-07T08:20:00.000Z",
          },
        ]
        const expectedRun = {
          id: "1",
          name: "Run 1",
          image: "test1:latest",
          command: ["echo"],
          status: "running",
          createdAt: "2025-07-07T08:20:00.000Z",
        }
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(runs),
        })

        const result = await service.getRunById("1")

        expect(result).toEqual(expectedRun)
      })
    })

    describe("deleteRun", () => {
      it("should delete run via API", async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
        })

        const result = await service.deleteRun("1")

        expect(result).toBe(true)
      })
    })

    describe("createRun", () => {
      it("should create new run via API", async () => {
        const mockRun = {
          id: "1",
          name: "Test Run",
          image: "test:latest",
          command: ["echo"],
          status: "running",
          createdAt: new Date().toISOString(),
        }
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockRun),
        })

        const result = await service.createRun("def1", { name: "Custom Run" })

        expect(mockFetch).toHaveBeenCalledWith("http://localhost:3001/api/test-runs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            test_definition_id: "def1",
            name: "Custom Run",
          }),
        })
        expect(result).toEqual(mockRun)
      })

      it("should throw error when create fails", async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
        })

        await expect(service.createRun("def1")).rejects.toThrow("Failed to create test run")
      })
    })
  })

  describe("subscribeToRuns", () => {
    it("should return an unsubscribe function", () => {
      const callback = vi.fn()
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
      })

      const unsubscribe = service.subscribeToRuns(callback)

      expect(typeof unsubscribe).toBe("function")
      unsubscribe()
    })

    it("should handle subscription setup without errors", () => {
      const callback = vi.fn()
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
      })

      expect(() => {
        const unsubscribe = service.subscribeToRuns(callback)
        unsubscribe()
      }).not.toThrow()
    })
  })

  describe("saveRun", () => {
    it("should save new run (POST) when no ID is provided", async () => {
      const newRun = {
        name: "Test Run",
        image: "test:latest",
        command: ["echo", "hello"],
        status: "pending",
        createdAt: new Date().toISOString(),
        definitionId: "def123",
        executorId: "exec456",
      }

      const expectedPayload = {
        name: "Test Run",
        image: "test:latest",
        command: ["echo", "hello"],
        status: "pending",
        created_at: newRun.createdAt,
        definition_id: "def123",
        executor_id: "exec456",
      }

      const savedRun = { id: "run123", ...newRun }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(savedRun),
      })

      const result = await service.saveRun(newRun as any)

      expect(mockFetch).toHaveBeenCalledWith("http://localhost:3001/api/test-runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(expectedPayload),
      })
      expect(result).toEqual(savedRun)
    })

    it("should update existing run (PUT) when ID is provided", async () => {
      const existingRun = {
        id: "run123",
        name: "Updated Run",
        image: "test:latest",
        command: ["echo", "updated"],
        status: "completed",
        createdAt: new Date().toISOString(),
        definitionId: "def123",
        executorId: "exec456",
      }

      const expectedPayload = {
        id: "run123",
        name: "Updated Run",
        image: "test:latest",
        command: ["echo", "updated"],
        status: "completed",
        created_at: existingRun.createdAt,
        definition_id: "def123",
        executor_id: "exec456",
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(existingRun),
      })

      const result = await service.saveRun(existingRun as any)

      expect(mockFetch).toHaveBeenCalledWith("http://localhost:3001/api/test-runs/run123", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(expectedPayload),
      })
      expect(result).toEqual(existingRun)
    })

    it("should throw error when save fails", async () => {
      const run = { name: "Test Run", status: "pending", createdAt: new Date().toISOString() }
      mockFetch.mockResolvedValueOnce({
        ok: false,
      })

      await expect(service.saveRun(run as any)).rejects.toThrow("Failed to save run")
    })
  })

  describe("suites", () => {
    describe("getSuites", () => {
      it("should fetch and transform test suites from API", async () => {
        const apiResponse = [
          {
            id: "suite1",
            name: "Test Suite 1",
            description: "Suite description",
            test_definition_ids: ["def1", "def2"],
            execution_mode: "sequential",
            created_at: "2025-07-07T10:00:00.000Z",
            labels: ["tag1", "tag2"],
          },
        ]

        const expectedResult = [
          {
            id: "suite1",
            name: "Test Suite 1",
            description: "Suite description",
            testDefinitionIds: ["def1", "def2"],
            executionMode: "sequential",
            createdAt: "2025-07-07T10:00:00.000Z",
            labels: ["tag1", "tag2"],
          },
        ]

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(apiResponse),
        })

        const result = await service.getSuites()

        expect(mockFetch).toHaveBeenCalledWith("http://localhost:3001/api/test-suites")
        expect(result).toEqual(expectedResult)
      })

      it("should handle API response with missing optional fields", async () => {
        const apiResponse = [
          {
            id: "suite1",
            name: "Minimal Suite",
            execution_mode: "parallel",
          },
        ]

        const expectedResult = [
          {
            id: "suite1",
            name: "Minimal Suite",
            description: "",
            testDefinitionIds: [],
            executionMode: "parallel",
            createdAt: expect.any(String),
            labels: [],
          },
        ]

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(apiResponse),
        })

        const result = await service.getSuites()
        expect(result).toEqual(expectedResult)
      })

      it("should throw error when API request fails", async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
        })

        await expect(service.getSuites()).rejects.toThrow("Failed to fetch test suites")
      })
    })

    describe("saveSuite", () => {
      it("should save new test suite (POST) when no ID is provided", async () => {
        const newSuite = {
          id: "",
          name: "New Suite",
          description: "Suite description",
          testDefinitionIds: ["def1", "def2"],
          executionMode: "sequential" as const,
          createdAt: "2025-07-07T10:00:00.000Z",
          labels: ["tag1"],
        }

        const expectedPayload = {
          id: "00000000-0000-0000-0000-000000000000",
          name: "New Suite",
          description: "Suite description",
          labels: ["tag1"],
          execution_mode: "sequential",
          test_definition_ids: [
            "00000000-0000-0000-0000-00000000def1",
            "00000000-0000-0000-0000-00000000def2",
          ],
          created_at: "2025-07-07T10:00:00.000Z",
        }

        const savedSuite = { ...newSuite, id: "suite123" }
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(savedSuite),
        })

        const result = await service.saveSuite(newSuite)

        expect(mockFetch).toHaveBeenCalledWith(
          "http://localhost:3001/api/test-suites",
          expect.objectContaining({
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(expectedPayload),
          })
        )
        expect(result).toEqual(savedSuite)
      })

      it("should update existing test suite (PUT) when ID is provided", async () => {
        const existingSuite = {
          id: "suite123",
          name: "Updated Suite",
          description: "Updated description",
          testDefinitionIds: ["12345678-1234-1234-1234-123456789012"], // Already UUID
          executionMode: "parallel" as const,
          createdAt: "2025-07-07T10:00:00.000Z",
          labels: [],
        }

        const expectedPayload = {
          id: "suite123",
          name: "Updated Suite",
          description: "Updated description",
          labels: [],
          execution_mode: "parallel",
          test_definition_ids: ["12345678-1234-1234-1234-123456789012"], // UUID preserved
          created_at: "2025-07-07T10:00:00.000Z",
        }

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(existingSuite),
        })

        const result = await service.saveSuite(existingSuite)

        expect(mockFetch).toHaveBeenCalledWith(
          "http://localhost:3001/api/test-suites/suite123",
          expect.objectContaining({
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(expectedPayload),
          })
        )
        expect(result).toEqual(existingSuite)
      })

      it("should throw error when save fails", async () => {
        const suite = {
          id: "test-suite",
          name: "Test Suite",
          executionMode: "sequential" as const,
          testDefinitionIds: [],
          createdAt: "",
          labels: [],
          description: "",
        }
        mockFetch.mockResolvedValueOnce({
          ok: false,
        })

        await expect(service.saveSuite(suite)).rejects.toThrow("Failed to save test suite")
      })
    })

    describe("deleteSuite", () => {
      it("should delete test suite with string ID conversion", async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
        })

        const result = await service.deleteSuite("def1")

        expect(mockFetch).toHaveBeenCalledWith(
          "http://localhost:3001/api/test-suites/00000000-0000-0000-0000-00000000def1",
          expect.objectContaining({
            method: "DELETE",
          })
        )
        expect(result).toBe(true)
      })

      it("should delete test suite with UUID ID (no conversion)", async () => {
        const uuidId = "12345678-1234-1234-1234-123456789012"
        mockFetch.mockResolvedValueOnce({
          ok: true,
        })

        const result = await service.deleteSuite(uuidId)

        expect(mockFetch).toHaveBeenCalledWith(
          `http://localhost:3001/api/test-suites/${uuidId}`,
          expect.objectContaining({
            method: "DELETE",
          })
        )
        expect(result).toBe(true)
      })

      it("should return false when delete fails", async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
        })

        const result = await service.deleteSuite("suite1")
        expect(result).toBe(false)
      })
    })

    describe("getSuiteById", () => {
      it("should fetch and transform specific test suite by string ID", async () => {
        const apiResponse = {
          id: "suite1",
          name: "Test Suite",
          description: "Suite description",
          test_definition_ids: ["def1"],
          execution_mode: "sequential",
          created_at: "2025-07-07T10:00:00.000Z",
          labels: ["tag1"],
        }

        const expectedResult = {
          id: "suite1",
          name: "Test Suite",
          description: "Suite description",
          testDefinitionIds: ["def1"],
          executionMode: "sequential",
          createdAt: "2025-07-07T10:00:00.000Z",
          labels: ["tag1"],
        }

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(apiResponse),
        })

        const result = await service.getSuiteById("suite1")

        expect(mockFetch).toHaveBeenCalledWith(
          "http://localhost:3001/api/test-suites/00000000-0000-0000-0000-000000suite1"
        )
        expect(result).toEqual(expectedResult)
      })

      it("should fetch test suite by UUID ID (no conversion)", async () => {
        const uuidId = "12345678-1234-1234-1234-123456789012"
        const apiResponse = {
          id: uuidId,
          name: "UUID Suite",
          execution_mode: "parallel",
        }

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(apiResponse),
        })

        const result = await service.getSuiteById(uuidId)

        expect(mockFetch).toHaveBeenCalledWith(`http://localhost:3001/api/test-suites/${uuidId}`)
        expect(result?.id).toBe(uuidId)
      })

      it("should throw error when API request fails", async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
        })

        await expect(service.getSuiteById("suite1")).rejects.toThrow("Failed to fetch test suite")
      })
    })
  })

  describe("kubernetes integration", () => {
    describe("getKubernetesHealth", () => {
      it("should fetch Kubernetes health status", async () => {
        const healthResponse = {
          healthy: true,
          cluster_info: {
            name: "test-cluster",
            version: "v1.25.0",
          },
        }

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(healthResponse),
        })

        const result = await service.getKubernetesHealth()

        expect(mockFetch).toHaveBeenCalledWith("http://localhost:3001/api/k8s/health")
        expect(result).toEqual(healthResponse)
      })

      it("should throw error when health check fails", async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
        })

        await expect(service.getKubernetesHealth()).rejects.toThrow(
          "Failed to check Kubernetes health"
        )
      })
    })

    describe("getTestRunLogs", () => {
      it("should fetch logs for a test run", async () => {
        const logsResponse = {
          job_name: "test-run-123",
          logs: "Pod started\nTest completed successfully",
          pod_status: "Succeeded",
        }

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(logsResponse),
        })

        const result = await service.getTestRunLogs("run123")

        expect(mockFetch).toHaveBeenCalledWith("http://localhost:3001/api/test-runs/run123/logs")
        expect(result).toEqual(logsResponse)
      })

      it("should throw error when log fetch fails", async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
        })

        await expect(service.getTestRunLogs("run123")).rejects.toThrow(
          "Failed to fetch logs for test run run123"
        )
      })
    })

    describe("getJobLogs", () => {
      it("should fetch logs for a specific job", async () => {
        const logsResponse = {
          job_name: "test-job-abc",
          logs: "Job execution logs here",
          pod_status: "Running",
        }

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(logsResponse),
        })

        const result = await service.getJobLogs("test-job-abc")

        expect(mockFetch).toHaveBeenCalledWith(
          "http://localhost:3001/api/k8s/jobs/test-job-abc/logs"
        )
        expect(result).toEqual(logsResponse)
      })

      it("should throw error when job log fetch fails", async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
        })

        await expect(service.getJobLogs("test-job-abc")).rejects.toThrow(
          "Failed to fetch logs for job test-job-abc"
        )
      })
    })

    describe("getJobStatus", () => {
      it("should fetch status for a specific job", async () => {
        const statusResponse = {
          job_name: "test-job-abc",
          status: "Running",
          active: 1,
          succeeded: 0,
          failed: 0,
        }

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(statusResponse),
        })

        const result = await service.getJobStatus("test-job-abc")

        expect(mockFetch).toHaveBeenCalledWith(
          "http://localhost:3001/api/k8s/jobs/test-job-abc/status"
        )
        expect(result).toEqual(statusResponse)
      })

      it("should throw error when status fetch fails", async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
        })

        await expect(service.getJobStatus("test-job-abc")).rejects.toThrow(
          "Failed to fetch status for job test-job-abc"
        )
      })
    })

    describe("deleteJob", () => {
      it("should delete a Kubernetes job", async () => {
        const deleteResponse = {
          success: true,
          message: "Job deleted successfully",
        }

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(deleteResponse),
        })

        const result = await service.deleteJob("test-job-abc")

        expect(mockFetch).toHaveBeenCalledWith("http://localhost:3001/api/k8s/jobs/test-job-abc", {
          method: "DELETE",
        })
        expect(result).toEqual(deleteResponse)
      })

      it("should throw error when job deletion fails", async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
        })

        await expect(service.deleteJob("test-job-abc")).rejects.toThrow(
          "Failed to delete job test-job-abc"
        )
      })
    })
  })

  describe("data transformation", () => {
    it("should properly handle runs data transformation from snake_case", async () => {
      const apiResponse = [
        {
          id: "run1",
          name: "Test Run 1",
          status: "completed",
          created_at: "2025-07-07T10:00:00.000Z",
          other_field: "value",
        },
        {
          id: "run4",
          name: "Test Run 4",
          status: "pending",
          created_at: "2025-07-07T09:00:00.000Z",
        },
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(apiResponse),
      })

      const result = await service.getRuns()

      // Should transform data and sort by newest first
      expect(result).toHaveLength(2)
      expect(result[0].id).toBe("run1") // Newest first
      expect(result[1].id).toBe("run4")
      expect(result[0]).toEqual({
        id: "run1",
        name: "Test Run 1",
        status: "completed",
        createdAt: "2025-07-07T10:00:00.000Z",
        other_field: "value",
      })
    })
  })

  describe("initialize", () => {
    it("should be a no-op for API mode", () => {
      expect(() => service.initialize()).not.toThrow()
    })
  })
})
