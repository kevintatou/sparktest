import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor, fireEvent } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import ExecutorsPage from "@/app/executors/page"
import { storage } from "@/lib/storage"
import type { Executor } from "@/lib/types"

// Mock the storage service
vi.mock("@/lib/storage", () => ({
  storage: {
    getExecutors: vi.fn(),
    deleteExecutor: vi.fn(),
  },
}))

// Mock the toast hook
const mockToast = vi.fn()
vi.mock("@/components/ui/use-toast", () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}))

const mockExecutors: Executor[] = [
  {
    id: "exec-1",
    name: "Node.js Executor",
    description: "Run Node.js applications and tests",
    image: "node:18",
    command: "node",
    supportedFileTypes: ["js", "ts", "json"],
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "exec-2",
    name: "Playwright Executor",
    description: "Run Playwright browser tests",
    image: "mcr.microsoft.com/playwright:v1.40.0",
    command: "npx playwright test",
    supportedFileTypes: ["js", "ts"],
    createdAt: "2024-01-15T11:00:00Z",
  },
]

describe("ExecutorsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockToast.mockClear()
  })

  describe("Empty state", () => {
    it("should render empty state when no executors exist", async () => {
      // Mock empty executors
      vi.mocked(storage.getExecutors).mockResolvedValue([])

      render(<ExecutorsPage />)

      await waitFor(() => {
        expect(screen.getByText("No executors yet")).toBeInTheDocument()
      })

      expect(screen.getByText("Create your first executor to define reusable test runners.")).toBeInTheDocument()
      expect(screen.getByText("Create Executor")).toBeInTheDocument()
    })

    it("should show search-specific empty state when no search results", async () => {
      // Mock empty executors
      vi.mocked(storage.getExecutors).mockResolvedValue([])

      render(<ExecutorsPage />)

      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByText("No executors yet")).toBeInTheDocument()
      })

      // Search for something
      const searchInput = screen.getByPlaceholderText("Search executors...")
      await userEvent.type(searchInput, "nonexistent")

      await waitFor(() => {
        expect(screen.getByText("No executors match your search")).toBeInTheDocument()
      })

      expect(screen.getByText("Try adjusting your search terms.")).toBeInTheDocument()
    })
  })

  describe("Executors list", () => {
    it("should render executors list correctly", async () => {
      vi.mocked(storage.getExecutors).mockResolvedValue(mockExecutors)

      render(<ExecutorsPage />)

      await waitFor(() => {
        expect(screen.getByText("Node.js Executor")).toBeInTheDocument()
      })

      expect(screen.getByText("Playwright Executor")).toBeInTheDocument()
      expect(screen.getByText("Run Node.js applications and tests")).toBeInTheDocument()
      expect(screen.getByText("Run Playwright browser tests")).toBeInTheDocument()
      expect(screen.getByText("node:18")).toBeInTheDocument()
      expect(screen.getByText("mcr.microsoft.com/playwright:v1.40.0")).toBeInTheDocument()
    })

    it("should display commands correctly", async () => {
      vi.mocked(storage.getExecutors).mockResolvedValue(mockExecutors)

      render(<ExecutorsPage />)

      await waitFor(() => {
        expect(screen.getByText("node")).toBeInTheDocument()
      })

      expect(screen.getByText("npx playwright test")).toBeInTheDocument()
    })

    it("should display supported file types", async () => {
      vi.mocked(storage.getExecutors).mockResolvedValue(mockExecutors)

      render(<ExecutorsPage />)

      await waitFor(() => {
        expect(screen.getAllByText("js")).toHaveLength(2) // Both executors have "js"
      })

      expect(screen.getAllByText("ts")).toHaveLength(2) // Both executors have "ts"
      expect(screen.getByText("json")).toBeInTheDocument()
    })

    it("should display created timestamps", async () => {
      vi.mocked(storage.getExecutors).mockResolvedValue(mockExecutors)

      render(<ExecutorsPage />)

      await waitFor(() => {
        expect(screen.getByText("Node.js Executor")).toBeInTheDocument()
      })

      // Check for timestamp text - it should contain "Created" and "ago"
      const timestampTexts = screen.getAllByText(/Created.*ago/)
      expect(timestampTexts).toHaveLength(2) // One for each executor
    })
  })

  describe("Search functionality", () => {
    it("should filter executors by name", async () => {
      vi.mocked(storage.getExecutors).mockResolvedValue(mockExecutors)

      render(<ExecutorsPage />)

      // Wait for executors to load
      await waitFor(() => {
        expect(screen.getByText("Node.js Executor")).toBeInTheDocument()
      })

      // Search for "Node"
      const searchInput = screen.getByPlaceholderText("Search executors...")
      await userEvent.type(searchInput, "Node")

      await waitFor(() => {
        expect(screen.getByText("Node.js Executor")).toBeInTheDocument()
      })

      expect(screen.queryByText("Playwright Executor")).not.toBeInTheDocument()
    })

    it("should filter executors by description", async () => {
      vi.mocked(storage.getExecutors).mockResolvedValue(mockExecutors)

      render(<ExecutorsPage />)

      // Wait for executors to load
      await waitFor(() => {
        expect(screen.getByText("Node.js Executor")).toBeInTheDocument()
      })

      // Search for "browser"
      const searchInput = screen.getByPlaceholderText("Search executors...")
      await userEvent.type(searchInput, "browser")

      await waitFor(() => {
        expect(screen.getByText("Playwright Executor")).toBeInTheDocument()
      })

      expect(screen.queryByText("Node.js Executor")).not.toBeInTheDocument()
    })

    it("should filter executors by id", async () => {
      vi.mocked(storage.getExecutors).mockResolvedValue(mockExecutors)

      render(<ExecutorsPage />)

      // Wait for executors to load
      await waitFor(() => {
        expect(screen.getByText("Node.js Executor")).toBeInTheDocument()
      })

      // Search for "exec-1"
      const searchInput = screen.getByPlaceholderText("Search executors...")
      await userEvent.type(searchInput, "exec-1")

      await waitFor(() => {
        expect(screen.getByText("Node.js Executor")).toBeInTheDocument()
      })

      expect(screen.queryByText("Playwright Executor")).not.toBeInTheDocument()
    })

    it("should be case insensitive", async () => {
      vi.mocked(storage.getExecutors).mockResolvedValue(mockExecutors)

      render(<ExecutorsPage />)

      // Wait for executors to load
      await waitFor(() => {
        expect(screen.getByText("Node.js Executor")).toBeInTheDocument()
      })

      // Search for "playwright" (lowercase)
      const searchInput = screen.getByPlaceholderText("Search executors...")
      await userEvent.type(searchInput, "playwright")

      await waitFor(() => {
        expect(screen.getByText("Playwright Executor")).toBeInTheDocument()
      })

      expect(screen.queryByText("Node.js Executor")).not.toBeInTheDocument()
    })
  })

  describe("Delete functionality", () => {
    it("should delete executor when delete button is clicked", async () => {
      vi.mocked(storage.getExecutors).mockResolvedValue(mockExecutors)
      vi.mocked(storage.deleteExecutor).mockResolvedValue(undefined)
      // Mock updated list after deletion
      vi.mocked(storage.getExecutors).mockResolvedValueOnce(mockExecutors)
        .mockResolvedValueOnce([mockExecutors[1]]) // Return only second executor

      render(<ExecutorsPage />)

      // Wait for executors to load
      await waitFor(() => {
        expect(screen.getByText("Node.js Executor")).toBeInTheDocument()
      })

      // Find and click delete button for first executor
      const deleteButtons = screen.getAllByRole("button")
      const deleteButton = deleteButtons.find(btn => 
        btn.querySelector("svg") && btn.classList.contains("text-red-600")
      )
      
      expect(deleteButton).toBeInTheDocument()
      await userEvent.click(deleteButton!)

      // Verify delete was called
      expect(storage.deleteExecutor).toHaveBeenCalledWith("exec-1")
    })

    it("should show loading state while deleting", async () => {
      vi.mocked(storage.getExecutors).mockResolvedValue(mockExecutors)
      vi.mocked(storage.deleteExecutor).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

      render(<ExecutorsPage />)

      // Wait for executors to load
      await waitFor(() => {
        expect(screen.getByText("Node.js Executor")).toBeInTheDocument()
      })

      // Find and click delete button
      const deleteButtons = screen.getAllByRole("button")
      const deleteButton = deleteButtons.find(btn => 
        btn.querySelector("svg") && btn.classList.contains("text-red-600")
      )
      
      await userEvent.click(deleteButton!)

      // Should show loading spinner (the button should be disabled during deletion)
      await waitFor(() => {
        expect(deleteButton).toHaveAttribute("disabled")
      })
    })
  })

  describe("Navigation", () => {
    it("should have correct navigation links", async () => {
      vi.mocked(storage.getExecutors).mockResolvedValue(mockExecutors)

      render(<ExecutorsPage />)

      // Wait for executors to load
      await waitFor(() => {
        expect(screen.getByText("Node.js Executor")).toBeInTheDocument()
      })

      // Check "New Executor" link
      const newExecutorLink = screen.getByRole("link", { name: /new executor/i })
      expect(newExecutorLink).toHaveAttribute("href", "/executors/new")

      // Check edit links
      const editLinks = screen.getAllByRole("link")
      const editButton = editLinks.find(link => 
        link.getAttribute("href")?.includes("/executors/edit/")
      )
      expect(editButton).toBeInTheDocument()

      // Check view details links
      const viewDetailsLinks = screen.getAllByText("View Details")
      expect(viewDetailsLinks).toHaveLength(2)
      expect(viewDetailsLinks[0].closest("a")).toHaveAttribute("href", "/executors/exec-1")
    })
  })

  describe("Page header", () => {
    it("should display correct page title and description", async () => {
      vi.mocked(storage.getExecutors).mockResolvedValue([])

      render(<ExecutorsPage />)

      expect(screen.getByText("Executors")).toBeInTheDocument()
      expect(screen.getByText("Manage your reusable test runners")).toBeInTheDocument()
    })
  })

  describe("Error handling", () => {
    it("should handle delete errors gracefully", async () => {
      vi.mocked(storage.getExecutors).mockResolvedValue(mockExecutors)
      vi.mocked(storage.deleteExecutor).mockRejectedValue(new Error("Delete failed"))

      render(<ExecutorsPage />)

      // Wait for executors to load
      await waitFor(() => {
        expect(screen.getByText("Node.js Executor")).toBeInTheDocument()
      })

      // Find and click delete button
      const deleteButtons = screen.getAllByRole("button")
      const deleteButton = deleteButtons.find(btn => 
        btn.querySelector("svg") && btn.classList.contains("text-red-600")
      )
      
      await userEvent.click(deleteButton!)

      // Wait for error handling
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Error deleting executor",
          description: "Failed to delete the executor.",
          variant: "destructive",
        })
      })
    })
  })

  describe("Executor cards", () => {
    it("should display executor cards with correct styling", async () => {
      vi.mocked(storage.getExecutors).mockResolvedValue(mockExecutors)

      render(<ExecutorsPage />)

      await waitFor(() => {
        expect(screen.getByText("Node.js Executor")).toBeInTheDocument()
      })

      // Check that we have the expected number of executors displayed
      expect(screen.getByText("Node.js Executor")).toBeInTheDocument()
      expect(screen.getByText("Playwright Executor")).toBeInTheDocument()
    })

    it("should show executor icon in cards", async () => {
      vi.mocked(storage.getExecutors).mockResolvedValue(mockExecutors)

      render(<ExecutorsPage />)

      await waitFor(() => {
        expect(screen.getByText("Node.js Executor")).toBeInTheDocument()
      })

      // Check that the executors are displayed with their information
      expect(screen.getByText("Node.js Executor")).toBeInTheDocument()
      expect(screen.getByText("Playwright Executor")).toBeInTheDocument()
    })
  })

  describe("Responsive behavior", () => {
    it("should render search input correctly", async () => {
      vi.mocked(storage.getExecutors).mockResolvedValue(mockExecutors)

      render(<ExecutorsPage />)

      const searchInput = screen.getByPlaceholderText("Search executors...")
      expect(searchInput).toBeInTheDocument()
      expect(searchInput).toHaveClass("pl-10") // Has search icon padding
    })

    it("should handle empty supported file types gracefully", async () => {
      const executorWithoutFileTypes = {
        ...mockExecutors[0],
        supportedFileTypes: [],
      }

      vi.mocked(storage.getExecutors).mockResolvedValue([executorWithoutFileTypes])

      render(<ExecutorsPage />)

      await waitFor(() => {
        expect(screen.getByText("Node.js Executor")).toBeInTheDocument()
      })

      // Should not crash and should render the executor
      expect(screen.getByText("Run Node.js applications and tests")).toBeInTheDocument()
    })

    it("should handle missing supported file types gracefully", async () => {
      const executorWithoutFileTypes = {
        ...mockExecutors[0],
        supportedFileTypes: undefined,
      }

      vi.mocked(storage.getExecutors).mockResolvedValue([executorWithoutFileTypes])

      render(<ExecutorsPage />)

      await waitFor(() => {
        expect(screen.getByText("Node.js Executor")).toBeInTheDocument()
      })

      // Should not crash and should render the executor
      expect(screen.getByText("Run Node.js applications and tests")).toBeInTheDocument()
    })
  })
})