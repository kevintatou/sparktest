import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { storage } from "@sparktest/core/storage"
import TestRunsPage from "../../app/runs/page"
import type { Run, Definition, Executor } from "@sparktest/core/types"

// Mock the storage module
vi.mock("@sparktest/core/storage", () => ({
  storage: {
    getRuns: vi.fn(),
    getDefinitions: vi.fn(),
    getExecutors: vi.fn(),
  },
}))

// Mock the toast hook
vi.mock("@/components/ui/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}))

// Mock formatDistanceToNow
vi.mock("@sparktest/core/utils", () => ({
  formatDistanceToNow: vi.fn(() => "2 minutes ago"),
}))

const mockDefinition: Definition = {
  id: "def-1",
  name: "Test Definition",
  description: "A test definition",
  image: "node:18",
  commands: ["npm test"],
  createdAt: "2023-01-01T00:00:00.000Z",
}

const mockExecutor: any = {
  id: "exec-1",
  name: "Test Executor",
  description: "A test executor",
  image: "node:18",
  command: "npm test",
  createdAt: "2023-01-01T00:00:00.000Z",
}

const mockRun: Run = {
  id: "run-1",
  name: "Test Run 1",
  image: "node:18",
  command: ["npm test"],
  definitionId: "def-1",
  executorId: "exec-1",
  status: "completed",
  duration: 120,
  createdAt: "2023-01-01T00:00:00.000Z",
  logs: ["Starting test", "Running tests", "Tests completed"],
  k8sJobName: "test-job-123",
}

describe("TestRunsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders empty state when no test runs are available", async () => {
    vi.mocked(storage.getRuns).mockResolvedValue([])
    vi.mocked(storage.getDefinitions).mockResolvedValue([])
    vi.mocked(storage.getExecutors).mockResolvedValue([])

    render(<TestRunsPage />)

    await waitFor(() => {
      expect(screen.getByText("Test Runs")).toBeInTheDocument()
    })

    expect(screen.getByText("No test runs yet")).toBeInTheDocument()
    expect(screen.getByText("Start your first test run to see execution results here.")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /Start Test Run/i })).toBeInTheDocument()
  })

  it("renders test runs when available", async () => {
    vi.mocked(storage.getRuns).mockResolvedValue([mockRun])
    vi.mocked(storage.getDefinitions).mockResolvedValue([mockDefinition])
    vi.mocked(storage.getExecutors).mockResolvedValue([mockExecutor])

    render(<TestRunsPage />)

    await waitFor(() => {
      expect(screen.getByText("Test Run 1")).toBeInTheDocument()
    })

    expect(screen.getByText("Run ID: run-1")).toBeInTheDocument()
    expect(screen.getByText("completed")).toBeInTheDocument()
    expect(screen.getByText("120s")).toBeInTheDocument()
    expect(screen.getByText("Test Definition")).toBeInTheDocument()
    expect(screen.getByText("Test Executor")).toBeInTheDocument()
  })

  it("displays different status colors and icons", async () => {
    const runs = [
      { ...mockRun, id: "run-1", name: "Test Run 1", status: "completed" as const },
      { ...mockRun, id: "run-2", name: "Test Run 2", status: "failed" as const },
      { ...mockRun, id: "run-3", name: "Test Run 3", status: "running" as const },
    ]
    vi.mocked(storage.getRuns).mockResolvedValue(runs)
    vi.mocked(storage.getDefinitions).mockResolvedValue([mockDefinition])
    vi.mocked(storage.getExecutors).mockResolvedValue([mockExecutor])

    render(<TestRunsPage />)

    await waitFor(() => {
      expect(screen.getByText("Test Run 1")).toBeInTheDocument()
    })

    // Check for different statuses
    expect(screen.getByText("completed")).toBeInTheDocument()
    expect(screen.getByText("failed")).toBeInTheDocument()
    expect(screen.getByText("running")).toBeInTheDocument()
  })

  it("filters test runs based on search query", async () => {
    const runs = [
      mockRun,
      {
        ...mockRun,
        id: "run-2",
        name: "Another Test Run",
      },
    ]
    vi.mocked(storage.getRuns).mockResolvedValue(runs)
    vi.mocked(storage.getDefinitions).mockResolvedValue([mockDefinition])
    vi.mocked(storage.getExecutors).mockResolvedValue([mockExecutor])

    render(<TestRunsPage />)

    await waitFor(() => {
      expect(screen.getByText("Test Run 1")).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText("Search runs...")
    fireEvent.change(searchInput, { target: { value: "Another" } })

    await waitFor(() => {
      expect(screen.getByText("Another Test Run")).toBeInTheDocument()
      expect(screen.queryByText("Test Run 1")).not.toBeInTheDocument()
    })
  })

  it("shows no results message when search yields no matches", async () => {
    vi.mocked(storage.getRuns).mockResolvedValue([mockRun])
    vi.mocked(storage.getDefinitions).mockResolvedValue([mockDefinition])
    vi.mocked(storage.getExecutors).mockResolvedValue([mockExecutor])

    render(<TestRunsPage />)

    await waitFor(() => {
      expect(screen.getByText("Test Run 1")).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText("Search runs...")
    fireEvent.change(searchInput, { target: { value: "nonexistent" } })

    await waitFor(() => {
      expect(screen.getByText("No test runs match your search")).toBeInTheDocument()
      expect(screen.getByText("Try adjusting your search terms.")).toBeInTheDocument()
    })
  })

  it("displays logs when available", async () => {
    vi.mocked(storage.getRuns).mockResolvedValue([mockRun])
    vi.mocked(storage.getDefinitions).mockResolvedValue([mockDefinition])
    vi.mocked(storage.getExecutors).mockResolvedValue([mockExecutor])

    render(<TestRunsPage />)

    await waitFor(() => {
      expect(screen.getByText("Test Run 1")).toBeInTheDocument()
    })

    expect(screen.getByText("Recent Logs")).toBeInTheDocument()
    expect(screen.getByText(/Starting test/)).toBeInTheDocument()
    expect(screen.getByText(/Running tests/)).toBeInTheDocument()
    expect(screen.getByText(/Tests completed/)).toBeInTheDocument()
  })

  it("displays Kubernetes job information when available", async () => {
    vi.mocked(storage.getRuns).mockResolvedValue([mockRun])
    vi.mocked(storage.getDefinitions).mockResolvedValue([mockDefinition])
    vi.mocked(storage.getExecutors).mockResolvedValue([mockExecutor])

    render(<TestRunsPage />)

    await waitFor(() => {
      expect(screen.getByText("Test Run 1")).toBeInTheDocument()
    })

    expect(screen.getByText("Kubernetes Job")).toBeInTheDocument()
    expect(screen.getByText("test-job-123")).toBeInTheDocument()
  })

  it("shows running duration for running tests", async () => {
    const runningRun = {
      ...mockRun,
      status: "running" as const,
      duration: undefined,
    }
    vi.mocked(storage.getRuns).mockResolvedValue([runningRun])
    vi.mocked(storage.getDefinitions).mockResolvedValue([mockDefinition])
    vi.mocked(storage.getExecutors).mockResolvedValue([mockExecutor])

    render(<TestRunsPage />)

    await waitFor(() => {
      expect(screen.getByText("Test Run 1")).toBeInTheDocument()
    })

    expect(screen.getByText("Running...")).toBeInTheDocument()
  })

  it("handles missing definition and executor names gracefully", async () => {
    const runWithMissingRefs = {
      ...mockRun,
      definitionId: "missing-def",
      executorId: "missing-exec",
    }
    vi.mocked(storage.getRuns).mockResolvedValue([runWithMissingRefs])
    vi.mocked(storage.getDefinitions).mockResolvedValue([])
    vi.mocked(storage.getExecutors).mockResolvedValue([])

    render(<TestRunsPage />)

    await waitFor(() => {
      expect(screen.getByText("Test Run 1")).toBeInTheDocument()
    })

    expect(screen.getByText("Definition missing-def")).toBeInTheDocument()
    expect(screen.getByText("Executor missing-exec")).toBeInTheDocument()
  })

  it("handles delete functionality", async () => {
    vi.mocked(storage.getRuns).mockResolvedValue([mockRun])
    vi.mocked(storage.getDefinitions).mockResolvedValue([mockDefinition])
    vi.mocked(storage.getExecutors).mockResolvedValue([mockExecutor])

    render(<TestRunsPage />)

    await waitFor(() => {
      expect(screen.getByText("Test Run 1")).toBeInTheDocument()
    })

    // Find delete button by its class
    const deleteButtons = screen.getAllByRole("button")
    const deleteButton = deleteButtons.find(button => 
      button.textContent === "Delete"
    )
    
    expect(deleteButton).toBeDefined()
    fireEvent.click(deleteButton!)

    // Check for disabled state during deletion
    await waitFor(() => {
      expect(deleteButton).toBeDisabled()
    })
  })

  it("does not show delete button for running tests", async () => {
    const runningRun = {
      ...mockRun,
      status: "running" as const,
    }
    vi.mocked(storage.getRuns).mockResolvedValue([runningRun])
    vi.mocked(storage.getDefinitions).mockResolvedValue([mockDefinition])
    vi.mocked(storage.getExecutors).mockResolvedValue([mockExecutor])

    render(<TestRunsPage />)

    await waitFor(() => {
      expect(screen.getByText("Test Run 1")).toBeInTheDocument()
    })

    // Should not have any buttons at all for running tests  
    expect(screen.queryAllByRole("button")).toHaveLength(0)
  })

  it("shows retry button for failed tests", async () => {
    const failedRun = {
      ...mockRun,
      status: "failed" as const,
    }
    vi.mocked(storage.getRuns).mockResolvedValue([failedRun])
    vi.mocked(storage.getDefinitions).mockResolvedValue([mockDefinition])
    vi.mocked(storage.getExecutors).mockResolvedValue([mockExecutor])

    render(<TestRunsPage />)

    await waitFor(() => {
      expect(screen.getByText("Test Run 1")).toBeInTheDocument()
    })

    expect(screen.getByRole("button", { name: /Retry/i })).toBeInTheDocument()
  })

  it("has proper navigation links", async () => {
    vi.mocked(storage.getRuns).mockResolvedValue([mockRun])
    vi.mocked(storage.getDefinitions).mockResolvedValue([mockDefinition])
    vi.mocked(storage.getExecutors).mockResolvedValue([mockExecutor])

    render(<TestRunsPage />)

    await waitFor(() => {
      expect(screen.getByText("Test Run 1")).toBeInTheDocument()
    })

    // Check for New Run link
    expect(screen.getByRole("link", { name: /New Run/i })).toHaveAttribute(
      "href",
      "/runs/new"
    )

    // Check for View Details link which should have actual text
    expect(screen.getByRole("link", { name: /View Details/i })).toHaveAttribute(
      "href",
      "/runs/run-1"
    )

    // Check for Logs link
    expect(screen.getByRole("link", { name: /View All/i })).toHaveAttribute(
      "href",
      "/runs/run-1"
    )
  })

  it("displays correct subtitle", async () => {
    vi.mocked(storage.getRuns).mockResolvedValue([])
    vi.mocked(storage.getDefinitions).mockResolvedValue([])
    vi.mocked(storage.getExecutors).mockResolvedValue([])

    render(<TestRunsPage />)

    await waitFor(() => {
      expect(screen.getByText("Test Runs")).toBeInTheDocument()
    })

    expect(screen.getByText("Monitor and manage your test runs")).toBeInTheDocument()
  })
})