import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor, fireEvent } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import TestRunsPage from "@/app/runs/page"
import { storage } from "@/lib/storage"
import type { Run, Definition, Executor } from "@/lib/types"

// Mock the storage service
vi.mock("@/lib/storage", () => ({
  storage: {
    getRuns: vi.fn(),
    getDefinitions: vi.fn(),
    getExecutors: vi.fn(),
  },
}))

// Mock the toast hook
const mockToast = vi.fn()
vi.mock("@/components/ui/use-toast", () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}))

const mockDefinitions: Definition[] = [
  {
    id: "def-1",
    name: "Frontend Tests",
    description: "Run frontend unit tests",
    image: "node:18",
    commands: ["npm", "test"],
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "def-2",
    name: "Backend Tests",
    description: "Run backend integration tests",
    image: "rust:1.75",
    commands: ["cargo", "test"],
    createdAt: "2024-01-15T11:00:00Z",
  },
]

const mockExecutors: Executor[] = [
  {
    id: "exec-1",
    name: "Node.js Executor",
    description: "Run Node.js applications and tests",
    image: "node:18",
    command: "node",
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "exec-2",
    name: "Rust Executor",
    description: "Run Rust applications and tests",
    image: "rust:1.75",
    command: "cargo",
    createdAt: "2024-01-15T11:00:00Z",
  },
]

const mockRuns: Run[] = [
  {
    id: "run-1",
    name: "Frontend Test Run",
    definitionId: "def-1",
    executorId: "exec-1",
    status: "completed",
    duration: 45,
    logs: ["Starting tests...", "Running unit tests...", "All tests passed!"],
    k8sJobName: "frontend-test-job-123",
    createdAt: "2024-01-15T12:00:00Z",
  },
  {
    id: "run-2",
    name: "Backend Test Run",
    definitionId: "def-2",
    executorId: "exec-2",
    status: "failed",
    duration: 30,
    logs: ["Starting tests...", "Running integration tests...", "Test failed: Connection refused"],
    k8sJobName: "backend-test-job-456",
    createdAt: "2024-01-15T13:00:00Z",
  },
  {
    id: "run-3",
    name: "Running Test",
    definitionId: "def-1",
    executorId: "exec-1",
    status: "running",
    logs: ["Starting tests...", "Running unit tests..."],
    k8sJobName: "running-test-job-789",
    createdAt: "2024-01-15T14:00:00Z",
  },
]

describe("TestRunsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockToast.mockClear()
  })

  describe("Empty state", () => {
    it("should render empty state when no runs exist", async () => {
      vi.mocked(storage.getRuns).mockResolvedValue([])
      vi.mocked(storage.getDefinitions).mockResolvedValue([])
      vi.mocked(storage.getExecutors).mockResolvedValue([])

      render(<TestRunsPage />)

      await waitFor(() => {
        expect(screen.getByText("No test runs yet")).toBeInTheDocument()
      })

      expect(screen.getByText("Start your first test run to see execution results here.")).toBeInTheDocument()
      expect(screen.getByText("Start Test Run")).toBeInTheDocument()
    })

    it("should show search-specific empty state when no search results", async () => {
      vi.mocked(storage.getRuns).mockResolvedValue([])
      vi.mocked(storage.getDefinitions).mockResolvedValue([])
      vi.mocked(storage.getExecutors).mockResolvedValue([])

      render(<TestRunsPage />)

      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByText("No test runs yet")).toBeInTheDocument()
      })

      // Search for something
      const searchInput = screen.getByPlaceholderText("Search runs...")
      await userEvent.type(searchInput, "nonexistent")

      await waitFor(() => {
        expect(screen.getByText("No test runs match your search")).toBeInTheDocument()
      })

      expect(screen.getByText("Try adjusting your search terms.")).toBeInTheDocument()
    })
  })

  describe("Test runs list", () => {
    it("should render test runs list correctly", async () => {
      vi.mocked(storage.getRuns).mockResolvedValue(mockRuns)
      vi.mocked(storage.getDefinitions).mockResolvedValue(mockDefinitions)
      vi.mocked(storage.getExecutors).mockResolvedValue(mockExecutors)

      render(<TestRunsPage />)

      await waitFor(() => {
        expect(screen.getByText("Frontend Test Run")).toBeInTheDocument()
      })

      expect(screen.getByText("Backend Test Run")).toBeInTheDocument()
      expect(screen.getByText("Running Test")).toBeInTheDocument()
    })

    it("should display status badges correctly", async () => {
      vi.mocked(storage.getRuns).mockResolvedValue(mockRuns)
      vi.mocked(storage.getDefinitions).mockResolvedValue(mockDefinitions)
      vi.mocked(storage.getExecutors).mockResolvedValue(mockExecutors)

      render(<TestRunsPage />)

      await waitFor(() => {
        expect(screen.getByText("completed")).toBeInTheDocument()
      })

      expect(screen.getByText("failed")).toBeInTheDocument()
      expect(screen.getByText("running")).toBeInTheDocument()
    })

    it("should display run details correctly", async () => {
      vi.mocked(storage.getRuns).mockResolvedValue(mockRuns)
      vi.mocked(storage.getDefinitions).mockResolvedValue(mockDefinitions)
      vi.mocked(storage.getExecutors).mockResolvedValue(mockExecutors)

      render(<TestRunsPage />)

      await waitFor(() => {
        expect(screen.getByText("Frontend Test Run")).toBeInTheDocument()
      })

      // Check duration display
      expect(screen.getByText("45s")).toBeInTheDocument()
      expect(screen.getByText("30s")).toBeInTheDocument()
      expect(screen.getByText("Running...")).toBeInTheDocument()

      // Check definition names - both runs use "Frontend Tests" definition
      expect(screen.getAllByText("Frontend Tests")).toHaveLength(2)

      // Check executor names
      expect(screen.getAllByText("Node.js Executor")).toHaveLength(2)
      expect(screen.getByText("Rust Executor")).toBeInTheDocument()
    })

    it("should display Kubernetes job information", async () => {
      vi.mocked(storage.getRuns).mockResolvedValue(mockRuns)
      vi.mocked(storage.getDefinitions).mockResolvedValue(mockDefinitions)
      vi.mocked(storage.getExecutors).mockResolvedValue(mockExecutors)

      render(<TestRunsPage />)

      await waitFor(() => {
        expect(screen.getByText("frontend-test-job-123")).toBeInTheDocument()
      })

      expect(screen.getByText("backend-test-job-456")).toBeInTheDocument()
      expect(screen.getByText("running-test-job-789")).toBeInTheDocument()
    })

    it("should display log previews", async () => {
      vi.mocked(storage.getRuns).mockResolvedValue(mockRuns)
      vi.mocked(storage.getDefinitions).mockResolvedValue(mockDefinitions)
      vi.mocked(storage.getExecutors).mockResolvedValue(mockExecutors)

      render(<TestRunsPage />)

      await waitFor(() => {
        expect(screen.getByText("All tests passed!")).toBeInTheDocument()
      })

      expect(screen.getByText("Test failed: Connection refused")).toBeInTheDocument()
    })

    it("should show log truncation when there are many logs", async () => {
      const runWithManyLogs = {
        ...mockRuns[0],
        logs: ["Log 1", "Log 2", "Log 3", "Log 4", "Log 5", "Log 6"],
      }

      vi.mocked(storage.getRuns).mockResolvedValue([runWithManyLogs])
      vi.mocked(storage.getDefinitions).mockResolvedValue(mockDefinitions)
      vi.mocked(storage.getExecutors).mockResolvedValue(mockExecutors)

      render(<TestRunsPage />)

      await waitFor(() => {
        expect(screen.getByText("... and 3 more lines")).toBeInTheDocument()
      })
    })
  })

  describe("Search functionality", () => {
    it("should filter runs by name", async () => {
      vi.mocked(storage.getRuns).mockResolvedValue(mockRuns)
      vi.mocked(storage.getDefinitions).mockResolvedValue(mockDefinitions)
      vi.mocked(storage.getExecutors).mockResolvedValue(mockExecutors)

      render(<TestRunsPage />)

      // Wait for runs to load
      await waitFor(() => {
        expect(screen.getByText("Frontend Test Run")).toBeInTheDocument()
      })

      // Search for "Frontend"
      const searchInput = screen.getByPlaceholderText("Search runs...")
      await userEvent.type(searchInput, "Frontend")

      await waitFor(() => {
        expect(screen.getByText("Frontend Test Run")).toBeInTheDocument()
      })

      expect(screen.queryByText("Backend Test Run")).not.toBeInTheDocument()
    })

    it("should filter runs by status", async () => {
      vi.mocked(storage.getRuns).mockResolvedValue(mockRuns)
      vi.mocked(storage.getDefinitions).mockResolvedValue(mockDefinitions)
      vi.mocked(storage.getExecutors).mockResolvedValue(mockExecutors)

      render(<TestRunsPage />)

      // Wait for runs to load
      await waitFor(() => {
        expect(screen.getByText("Frontend Test Run")).toBeInTheDocument()
      })

      // Search for "completed"
      const searchInput = screen.getByPlaceholderText("Search runs...")
      await userEvent.type(searchInput, "completed")

      await waitFor(() => {
        expect(screen.getByText("Frontend Test Run")).toBeInTheDocument()
      })

      expect(screen.queryByText("Backend Test Run")).not.toBeInTheDocument()
    })

    it("should filter runs by definition name", async () => {
      vi.mocked(storage.getRuns).mockResolvedValue(mockRuns)
      vi.mocked(storage.getDefinitions).mockResolvedValue(mockDefinitions)
      vi.mocked(storage.getExecutors).mockResolvedValue(mockExecutors)

      render(<TestRunsPage />)

      // Wait for runs to load
      await waitFor(() => {
        expect(screen.getByText("Frontend Test Run")).toBeInTheDocument()
      })

      // Search for "Backend Tests" (definition name)
      const searchInput = screen.getByPlaceholderText("Search runs...")
      await userEvent.type(searchInput, "Backend Tests")

      await waitFor(() => {
        expect(screen.getByText("Backend Test Run")).toBeInTheDocument()
      })

      expect(screen.queryByText("Frontend Test Run")).not.toBeInTheDocument()
    })

    it("should filter runs by executor name", async () => {
      vi.mocked(storage.getRuns).mockResolvedValue(mockRuns)
      vi.mocked(storage.getDefinitions).mockResolvedValue(mockDefinitions)
      vi.mocked(storage.getExecutors).mockResolvedValue(mockExecutors)

      render(<TestRunsPage />)

      // Wait for runs to load
      await waitFor(() => {
        expect(screen.getByText("Frontend Test Run")).toBeInTheDocument()
      })

      // Search for "Rust Executor" (executor name)
      const searchInput = screen.getByPlaceholderText("Search runs...")
      await userEvent.type(searchInput, "Rust Executor")

      await waitFor(() => {
        expect(screen.getByText("Backend Test Run")).toBeInTheDocument()
      })

      expect(screen.queryByText("Frontend Test Run")).not.toBeInTheDocument()
    })

    it("should be case insensitive", async () => {
      vi.mocked(storage.getRuns).mockResolvedValue(mockRuns)
      vi.mocked(storage.getDefinitions).mockResolvedValue(mockDefinitions)
      vi.mocked(storage.getExecutors).mockResolvedValue(mockExecutors)

      render(<TestRunsPage />)

      // Wait for runs to load
      await waitFor(() => {
        expect(screen.getByText("Frontend Test Run")).toBeInTheDocument()
      })

      // Search for "frontend" (lowercase)
      const searchInput = screen.getByPlaceholderText("Search runs...")
      await userEvent.type(searchInput, "frontend")

      await waitFor(() => {
        expect(screen.getByText("Frontend Test Run")).toBeInTheDocument()
      })

      expect(screen.queryByText("Backend Test Run")).not.toBeInTheDocument()
    })
  })

  describe("Delete functionality", () => {
    it("should delete run when delete button is clicked", async () => {
      vi.mocked(storage.getRuns).mockResolvedValue(mockRuns)
      vi.mocked(storage.getDefinitions).mockResolvedValue(mockDefinitions)
      vi.mocked(storage.getExecutors).mockResolvedValue(mockExecutors)

      render(<TestRunsPage />)

      // Wait for runs to load
      await waitFor(() => {
        expect(screen.getByText("Frontend Test Run")).toBeInTheDocument()
      })

      // Find and click delete button (should only be available for non-running tests)
      const deleteButtons = screen.getAllByText("Delete")
      expect(deleteButtons).toHaveLength(2) // Only for completed and failed runs

      await userEvent.click(deleteButtons[0])

      // Should remove the run from the list
      await waitFor(() => {
        expect(screen.queryByText("Frontend Test Run")).not.toBeInTheDocument()
      })
    })

    it("should show loading state while deleting", async () => {
      vi.mocked(storage.getRuns).mockResolvedValue(mockRuns)
      vi.mocked(storage.getDefinitions).mockResolvedValue(mockDefinitions)
      vi.mocked(storage.getExecutors).mockResolvedValue(mockExecutors)

      render(<TestRunsPage />)

      // Wait for runs to load
      await waitFor(() => {
        expect(screen.getByText("Frontend Test Run")).toBeInTheDocument()
      })

      // Find and click delete button
      const deleteButtons = screen.getAllByText("Delete")
      await userEvent.click(deleteButtons[0])

      // Should show loading state temporarily (button disabled during deletion)
      await waitFor(() => {
        expect(deleteButtons[0]).toHaveAttribute("disabled")
      })
    })

    it("should not show delete button for running tests", async () => {
      const runningRun = {
        ...mockRuns[0],
        status: "running" as const,
      }

      vi.mocked(storage.getRuns).mockResolvedValue([runningRun])
      vi.mocked(storage.getDefinitions).mockResolvedValue(mockDefinitions)
      vi.mocked(storage.getExecutors).mockResolvedValue(mockExecutors)

      render(<TestRunsPage />)

      await waitFor(() => {
        expect(screen.getByText("Frontend Test Run")).toBeInTheDocument()
      })

      // Should not have delete button for running tests
      expect(screen.queryByText("Delete")).not.toBeInTheDocument()
    })
  })

  describe("Navigation", () => {
    it("should have correct navigation links", async () => {
      vi.mocked(storage.getRuns).mockResolvedValue(mockRuns)
      vi.mocked(storage.getDefinitions).mockResolvedValue(mockDefinitions)
      vi.mocked(storage.getExecutors).mockResolvedValue(mockExecutors)

      render(<TestRunsPage />)

      // Wait for runs to load
      await waitFor(() => {
        expect(screen.getByText("Frontend Test Run")).toBeInTheDocument()
      })

      // Check "New Run" link
      const newRunLink = screen.getByRole("link", { name: /new run/i })
      expect(newRunLink).toHaveAttribute("href", "/runs/new")

      // Check "View Details" links
      const viewDetailsLinks = screen.getAllByText("View Details")
      expect(viewDetailsLinks).toHaveLength(3)
      expect(viewDetailsLinks[0].closest("a")).toHaveAttribute("href", "/runs/run-1")

      // Check "Logs" links
      const logsLinks = screen.getAllByText("Logs")
      expect(logsLinks).toHaveLength(3)
      expect(logsLinks[0].closest("a")).toHaveAttribute("href", "/runs/run-1#logs")
    })

    it("should show retry button for failed runs", async () => {
      vi.mocked(storage.getRuns).mockResolvedValue(mockRuns)
      vi.mocked(storage.getDefinitions).mockResolvedValue(mockDefinitions)
      vi.mocked(storage.getExecutors).mockResolvedValue(mockExecutors)

      render(<TestRunsPage />)

      await waitFor(() => {
        expect(screen.getByText("Backend Test Run")).toBeInTheDocument()
      })

      // Should have retry button for failed runs
      const retryButtons = screen.getAllByText("Retry")
      expect(retryButtons).toHaveLength(1)
    })
  })

  describe("Page header", () => {
    it("should display correct page title and description", async () => {
      vi.mocked(storage.getRuns).mockResolvedValue([])
      vi.mocked(storage.getDefinitions).mockResolvedValue([])
      vi.mocked(storage.getExecutors).mockResolvedValue([])

      render(<TestRunsPage />)

      expect(screen.getByText("Test Runs")).toBeInTheDocument()
      expect(screen.getByText("Monitor and manage your test runs")).toBeInTheDocument()
    })
  })

  describe("Helper functions", () => {
    it("should handle missing definition names gracefully", async () => {
      const runWithMissingDefinition = {
        ...mockRuns[0],
        definitionId: "non-existent-def",
      }

      vi.mocked(storage.getRuns).mockResolvedValue([runWithMissingDefinition])
      vi.mocked(storage.getDefinitions).mockResolvedValue(mockDefinitions)
      vi.mocked(storage.getExecutors).mockResolvedValue(mockExecutors)

      render(<TestRunsPage />)

      await waitFor(() => {
        expect(screen.getByText("Definition non-existent-def")).toBeInTheDocument()
      })
    })

    it("should handle missing executor names gracefully", async () => {
      const runWithMissingExecutor = {
        ...mockRuns[0],
        executorId: "non-existent-exec",
      }

      vi.mocked(storage.getRuns).mockResolvedValue([runWithMissingExecutor])
      vi.mocked(storage.getDefinitions).mockResolvedValue(mockDefinitions)
      vi.mocked(storage.getExecutors).mockResolvedValue(mockExecutors)

      render(<TestRunsPage />)

      await waitFor(() => {
        expect(screen.getByText("Executor non-existent-exec")).toBeInTheDocument()
      })
    })

    it("should handle missing definition/executor IDs gracefully", async () => {
      const runWithMissingIds = {
        ...mockRuns[0],
        definitionId: undefined,
        executorId: undefined,
      }

      vi.mocked(storage.getRuns).mockResolvedValue([runWithMissingIds])
      vi.mocked(storage.getDefinitions).mockResolvedValue(mockDefinitions)
      vi.mocked(storage.getExecutors).mockResolvedValue(mockExecutors)

      render(<TestRunsPage />)

      await waitFor(() => {
        expect(screen.getByText("Frontend Test Run")).toBeInTheDocument()
      })

      // Should show "Unknown" for missing definition/executor
      expect(screen.getAllByText("Unknown")).toHaveLength(2)
    })
  })

  describe("Error handling", () => {
    it("should handle data loading errors gracefully", async () => {
      vi.mocked(storage.getRuns).mockRejectedValue(new Error("Failed to load runs"))
      vi.mocked(storage.getDefinitions).mockResolvedValue([])
      vi.mocked(storage.getExecutors).mockResolvedValue([])

      render(<TestRunsPage />)

      // Wait for error handling
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Error",
          description: "Failed to load test runs data",
          variant: "destructive",
        })
      })
    })

    it("should handle logs as string instead of array", async () => {
      const runWithStringLogs = {
        ...mockRuns[0],
        logs: "Single log string",
      }

      vi.mocked(storage.getRuns).mockResolvedValue([runWithStringLogs])
      vi.mocked(storage.getDefinitions).mockResolvedValue(mockDefinitions)
      vi.mocked(storage.getExecutors).mockResolvedValue(mockExecutors)

      render(<TestRunsPage />)

      await waitFor(() => {
        expect(screen.getByText("Single log string")).toBeInTheDocument()
      })
    })

    it("should handle missing logs gracefully", async () => {
      const runWithoutLogs = {
        ...mockRuns[0],
        logs: undefined,
      }

      vi.mocked(storage.getRuns).mockResolvedValue([runWithoutLogs])
      vi.mocked(storage.getDefinitions).mockResolvedValue(mockDefinitions)
      vi.mocked(storage.getExecutors).mockResolvedValue(mockExecutors)

      render(<TestRunsPage />)

      await waitFor(() => {
        expect(screen.getByText("Frontend Test Run")).toBeInTheDocument()
      })

      // Should not crash and should render the run
      expect(screen.getByText("completed")).toBeInTheDocument()
    })
  })
})