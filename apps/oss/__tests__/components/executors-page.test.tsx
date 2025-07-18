import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { storage } from "@sparktest/core/storage"
import ExecutorsPage from "../../app/executors/page"
import type { Executor } from "@sparktest/core/types"

// Mock the storage module
vi.mock("@sparktest/core/storage", () => ({
  storage: {
    getExecutors: vi.fn(),
    deleteExecutor: vi.fn(),
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

const mockExecutor: any = {
  id: "executor-1",
  name: "Test Executor",
  description: "A test executor for testing",
  image: "node:18",
  command: "npm test",
  supportedFileTypes: ["js", "ts"],
  createdAt: "2023-01-01T00:00:00.000Z",
}

describe("ExecutorsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders empty state when no executors are available", async () => {
    vi.mocked(storage.getExecutors).mockResolvedValue([])

    render(<ExecutorsPage />)

    await waitFor(() => {
      expect(screen.getByText("Executors")).toBeInTheDocument()
    })

    expect(screen.getByText("No executors yet")).toBeInTheDocument()
    expect(screen.getByText("Create your first executor to define reusable test runners.")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /Create Executor/i })).toBeInTheDocument()
  })

  it("renders executors when available", async () => {
    vi.mocked(storage.getExecutors).mockResolvedValue([mockExecutor])

    render(<ExecutorsPage />)

    await waitFor(() => {
      expect(screen.getByText("Test Executor")).toBeInTheDocument()
    })

    expect(screen.getByText("A test executor for testing")).toBeInTheDocument()
    expect(screen.getByText("node:18")).toBeInTheDocument()
    expect(screen.getByText("npm test")).toBeInTheDocument()
    expect(screen.getByText("js")).toBeInTheDocument()
    expect(screen.getByText("ts")).toBeInTheDocument()
  })

  it("filters executors based on search query", async () => {
    const executors = [
      mockExecutor,
      {
        ...mockExecutor,
        id: "executor-2",
        name: "Another Executor",
        description: "Different description",
      },
    ]
    vi.mocked(storage.getExecutors).mockResolvedValue(executors)

    render(<ExecutorsPage />)

    await waitFor(() => {
      expect(screen.getByText("Test Executor")).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText("Search executors...")
    fireEvent.change(searchInput, { target: { value: "Another" } })

    await waitFor(() => {
      expect(screen.getByText("Another Executor")).toBeInTheDocument()
      expect(screen.queryByText("Test Executor")).not.toBeInTheDocument()
    })
  })

  it("shows no results message when search yields no matches", async () => {
    vi.mocked(storage.getExecutors).mockResolvedValue([mockExecutor])

    render(<ExecutorsPage />)

    await waitFor(() => {
      expect(screen.getByText("Test Executor")).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText("Search executors...")
    fireEvent.change(searchInput, { target: { value: "nonexistent" } })

    await waitFor(() => {
      expect(screen.getByText("No executors match your search")).toBeInTheDocument()
      expect(screen.getByText("Try adjusting your search terms.")).toBeInTheDocument()
    })
  })

  it("calls deleteExecutor when delete button is clicked", async () => {
    vi.mocked(storage.getExecutors).mockResolvedValue([mockExecutor])
    vi.mocked(storage.deleteExecutor).mockResolvedValue(undefined)

    render(<ExecutorsPage />)

    await waitFor(() => {
      expect(screen.getByText("Test Executor")).toBeInTheDocument()
    })

    // Find delete button by its red styling
    const deleteButtons = screen.getAllByRole("button")
    const deleteButton = deleteButtons.find(button => 
      button.className.includes("text-red-600")
    )
    
    expect(deleteButton).toBeDefined()
    fireEvent.click(deleteButton!)

    await waitFor(() => {
      expect(storage.deleteExecutor).toHaveBeenCalledWith("executor-1")
    })
  })

  it("shows loading state when deleting", async () => {
    vi.mocked(storage.getExecutors).mockResolvedValue([mockExecutor])
    vi.mocked(storage.deleteExecutor).mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    )

    render(<ExecutorsPage />)

    await waitFor(() => {
      expect(screen.getByText("Test Executor")).toBeInTheDocument()
    })

    const deleteButtons = screen.getAllByRole("button")
    const deleteButton = deleteButtons.find(button => 
      button.className.includes("text-red-600")
    )
    
    expect(deleteButton).toBeDefined()
    fireEvent.click(deleteButton!)

    // Check for loading spinner
    await waitFor(() => {
      expect(deleteButton).toBeDisabled()
    })
  })

  it("has proper navigation links", async () => {
    vi.mocked(storage.getExecutors).mockResolvedValue([mockExecutor])

    render(<ExecutorsPage />)

    await waitFor(() => {
      expect(screen.getByText("Test Executor")).toBeInTheDocument()
    })

    // Check for New Executor link
    expect(screen.getByRole("link", { name: /New Executor/i })).toHaveAttribute(
      "href",
      "/executors/new"
    )

    // Check for View Details link which has actual text
    expect(screen.getByRole("link", { name: /View Details/i })).toHaveAttribute(
      "href",
      "/executors/executor-1"
    )

    // Check for Edit link by finding all links and filtering by href (edit has no text, just icon)
    const allLinks = screen.getAllByRole("link")
    const editLink = allLinks.find(link => 
      link.getAttribute("href") === "/executors/edit/executor-1"
    )
    expect(editLink).toBeTruthy()
  })

  it("displays executor without supported file types", async () => {
    const executorWithoutFileTypes = {
      ...mockExecutor,
      supportedFileTypes: undefined,
    }
    vi.mocked(storage.getExecutors).mockResolvedValue([executorWithoutFileTypes])

    render(<ExecutorsPage />)

    await waitFor(() => {
      expect(screen.getByText("Test Executor")).toBeInTheDocument()
    })

    // Should not show file type badges
    expect(screen.queryByText("js")).not.toBeInTheDocument()
    expect(screen.queryByText("ts")).not.toBeInTheDocument()
  })

  it("displays executor with empty supported file types", async () => {
    const executorWithEmptyFileTypes = {
      ...mockExecutor,
      supportedFileTypes: [],
    }
    vi.mocked(storage.getExecutors).mockResolvedValue([executorWithEmptyFileTypes])

    render(<ExecutorsPage />)

    await waitFor(() => {
      expect(screen.getByText("Test Executor")).toBeInTheDocument()
    })

    // Should not show file type badges
    expect(screen.queryByText("js")).not.toBeInTheDocument()
    expect(screen.queryByText("ts")).not.toBeInTheDocument()
  })

  it("shows correct subtitle", async () => {
    vi.mocked(storage.getExecutors).mockResolvedValue([])

    render(<ExecutorsPage />)

    await waitFor(() => {
      expect(screen.getByText("Executors")).toBeInTheDocument()
    })

    expect(screen.getByText("Manage your reusable test runners")).toBeInTheDocument()
  })
})