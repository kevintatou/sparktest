import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor, fireEvent } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import DefinitionsPage from "@/app/definitions/page"
import { storage } from "@/lib/storage"
import type { Definition } from "@/lib/types"

// Mock the storage service
vi.mock("@/lib/storage", () => ({
  storage: {
    getDefinitions: vi.fn(),
    deleteDefinition: vi.fn(),
    createRun: vi.fn(),
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
    labels: ["frontend", "unit"],
    executorId: "node-executor",
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "def-2",
    name: "Backend Tests",
    description: "Run backend integration tests",
    image: "rust:1.75",
    commands: ["cargo", "test"],
    labels: ["backend", "integration"],
    createdAt: "2024-01-15T11:00:00Z",
  },
]

describe("DefinitionsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockToast.mockClear()
  })

  describe("Empty state", () => {
    it("should render empty state when no definitions exist", async () => {
      // Mock empty definitions
      vi.mocked(storage.getDefinitions).mockResolvedValue([])

      render(<DefinitionsPage />)

      await waitFor(() => {
        expect(screen.getByText("No test definitions yet")).toBeInTheDocument()
      })

      expect(screen.getByText("Create your first test definition to get started.")).toBeInTheDocument()
      expect(screen.getByText("Create Definition")).toBeInTheDocument()
    })

    it("should show search-specific empty state when no search results", async () => {
      // Mock empty definitions
      vi.mocked(storage.getDefinitions).mockResolvedValue([])

      render(<DefinitionsPage />)

      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByText("No test definitions yet")).toBeInTheDocument()
      })

      // Search for something
      const searchInput = screen.getByPlaceholderText("Search definitions...")
      await userEvent.type(searchInput, "nonexistent")

      await waitFor(() => {
        expect(screen.getByText("No definitions match your search")).toBeInTheDocument()
      })

      expect(screen.getByText("Try adjusting your search terms.")).toBeInTheDocument()
    })
  })

  describe("Definitions list", () => {
    it("should render definitions list correctly", async () => {
      vi.mocked(storage.getDefinitions).mockResolvedValue(mockDefinitions)

      render(<DefinitionsPage />)

      await waitFor(() => {
        expect(screen.getByText("Frontend Tests")).toBeInTheDocument()
      })

      expect(screen.getByText("Backend Tests")).toBeInTheDocument()
      expect(screen.getByText("Run frontend unit tests")).toBeInTheDocument()
      expect(screen.getByText("Run backend integration tests")).toBeInTheDocument()
      expect(screen.getByText("node:18")).toBeInTheDocument()
      expect(screen.getByText("rust:1.75")).toBeInTheDocument()
    })

    it("should display labels correctly", async () => {
      vi.mocked(storage.getDefinitions).mockResolvedValue(mockDefinitions)

      render(<DefinitionsPage />)

      await waitFor(() => {
        expect(screen.getByText("frontend")).toBeInTheDocument()
      })

      expect(screen.getByText("unit")).toBeInTheDocument()
      expect(screen.getByText("backend")).toBeInTheDocument()
      expect(screen.getByText("integration")).toBeInTheDocument()
    })

    it("should display executor badges", async () => {
      vi.mocked(storage.getDefinitions).mockResolvedValue(mockDefinitions)

      render(<DefinitionsPage />)

      await waitFor(() => {
        expect(screen.getByText("node-executor")).toBeInTheDocument()
      })
    })

    it("should display commands correctly", async () => {
      vi.mocked(storage.getDefinitions).mockResolvedValue(mockDefinitions)

      render(<DefinitionsPage />)

      await waitFor(() => {
        expect(screen.getByText("npm, test")).toBeInTheDocument()
      })

      expect(screen.getByText("cargo, test")).toBeInTheDocument()
    })
  })

  describe("Search functionality", () => {
    it("should filter definitions by name", async () => {
      vi.mocked(storage.getDefinitions).mockResolvedValue(mockDefinitions)

      render(<DefinitionsPage />)

      // Wait for definitions to load
      await waitFor(() => {
        expect(screen.getByText("Frontend Tests")).toBeInTheDocument()
      })

      // Search for "Frontend"
      const searchInput = screen.getByPlaceholderText("Search definitions...")
      await userEvent.type(searchInput, "Frontend")

      await waitFor(() => {
        expect(screen.getByText("Frontend Tests")).toBeInTheDocument()
      })

      expect(screen.queryByText("Backend Tests")).not.toBeInTheDocument()
    })

    it("should filter definitions by description", async () => {
      vi.mocked(storage.getDefinitions).mockResolvedValue(mockDefinitions)

      render(<DefinitionsPage />)

      // Wait for definitions to load
      await waitFor(() => {
        expect(screen.getByText("Frontend Tests")).toBeInTheDocument()
      })

      // Search for "unit"
      const searchInput = screen.getByPlaceholderText("Search definitions...")
      await userEvent.type(searchInput, "unit")

      await waitFor(() => {
        expect(screen.getByText("Frontend Tests")).toBeInTheDocument()
      })

      expect(screen.queryByText("Backend Tests")).not.toBeInTheDocument()
    })

    it("should filter definitions by id", async () => {
      vi.mocked(storage.getDefinitions).mockResolvedValue(mockDefinitions)

      render(<DefinitionsPage />)

      // Wait for definitions to load
      await waitFor(() => {
        expect(screen.getByText("Frontend Tests")).toBeInTheDocument()
      })

      // Search for "def-1"
      const searchInput = screen.getByPlaceholderText("Search definitions...")
      await userEvent.type(searchInput, "def-1")

      await waitFor(() => {
        expect(screen.getByText("Frontend Tests")).toBeInTheDocument()
      })

      expect(screen.queryByText("Backend Tests")).not.toBeInTheDocument()
    })

    it("should be case insensitive", async () => {
      vi.mocked(storage.getDefinitions).mockResolvedValue(mockDefinitions)

      render(<DefinitionsPage />)

      // Wait for definitions to load
      await waitFor(() => {
        expect(screen.getByText("Frontend Tests")).toBeInTheDocument()
      })

      // Search for "frontend" (lowercase)
      const searchInput = screen.getByPlaceholderText("Search definitions...")
      await userEvent.type(searchInput, "frontend")

      await waitFor(() => {
        expect(screen.getByText("Frontend Tests")).toBeInTheDocument()
      })

      expect(screen.queryByText("Backend Tests")).not.toBeInTheDocument()
    })
  })

  describe("Delete functionality", () => {
    it("should delete definition when delete button is clicked", async () => {
      vi.mocked(storage.getDefinitions).mockResolvedValue(mockDefinitions)
      vi.mocked(storage.deleteDefinition).mockResolvedValue(undefined)
      // Mock updated list after deletion
      vi.mocked(storage.getDefinitions).mockResolvedValueOnce(mockDefinitions)
        .mockResolvedValueOnce([mockDefinitions[1]]) // Return only second definition

      render(<DefinitionsPage />)

      // Wait for definitions to load
      await waitFor(() => {
        expect(screen.getByText("Frontend Tests")).toBeInTheDocument()
      })

      // Find and click delete button for first definition
      const deleteButtons = screen.getAllByRole("button")
      const deleteButton = deleteButtons.find(btn => 
        btn.querySelector("svg") && btn.classList.contains("text-red-600")
      )
      
      expect(deleteButton).toBeInTheDocument()
      await userEvent.click(deleteButton!)

      // Verify delete was called
      expect(storage.deleteDefinition).toHaveBeenCalledWith("def-1")
    })

    it("should show loading state while deleting", async () => {
      vi.mocked(storage.getDefinitions).mockResolvedValue(mockDefinitions)
      vi.mocked(storage.deleteDefinition).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

      render(<DefinitionsPage />)

      // Wait for definitions to load
      await waitFor(() => {
        expect(screen.getByText("Frontend Tests")).toBeInTheDocument()
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

  describe("Run test functionality", () => {
    it("should create run when run button is clicked", async () => {
      vi.mocked(storage.getDefinitions).mockResolvedValue(mockDefinitions)
      vi.mocked(storage.createRun).mockResolvedValue({
        id: "run-1",
        name: "Test Run",
        definitionId: "def-1",
        status: "pending",
        createdAt: "2024-01-15T12:00:00Z",
      })

      render(<DefinitionsPage />)

      // Wait for definitions to load
      await waitFor(() => {
        expect(screen.getByText("Frontend Tests")).toBeInTheDocument()
      })

      // Find and click run button
      const runButtons = screen.getAllByText("Run")
      await userEvent.click(runButtons[0])

      // Verify createRun was called
      expect(storage.createRun).toHaveBeenCalledWith("def-1")
    })
  })

  describe("Navigation", () => {
    it("should have correct navigation links", async () => {
      vi.mocked(storage.getDefinitions).mockResolvedValue(mockDefinitions)

      render(<DefinitionsPage />)

      // Wait for definitions to load
      await waitFor(() => {
        expect(screen.getByText("Frontend Tests")).toBeInTheDocument()
      })

      // Check "New Definition" link
      const newDefinitionLink = screen.getByRole("link", { name: /new definition/i })
      expect(newDefinitionLink).toHaveAttribute("href", "/definitions/new")

      // Check edit links
      const editLinks = screen.getAllByRole("link")
      const editButton = editLinks.find(link => 
        link.getAttribute("href")?.includes("/definitions/edit/")
      )
      expect(editButton).toBeInTheDocument()
    })
  })

  describe("Page header", () => {
    it("should display correct page title and description", async () => {
      vi.mocked(storage.getDefinitions).mockResolvedValue([])

      render(<DefinitionsPage />)

      expect(screen.getByText("Test Definitions")).toBeInTheDocument()
      expect(screen.getByText("Manage your reusable test blueprints")).toBeInTheDocument()
    })
  })

  describe("Error handling", () => {
    it("should handle delete errors gracefully", async () => {
      vi.mocked(storage.getDefinitions).mockResolvedValue(mockDefinitions)
      vi.mocked(storage.deleteDefinition).mockRejectedValue(new Error("Delete failed"))

      render(<DefinitionsPage />)

      // Wait for definitions to load
      await waitFor(() => {
        expect(screen.getByText("Frontend Tests")).toBeInTheDocument()
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
          title: "Error deleting definition",
          description: "Failed to delete the test definition.",
          variant: "destructive",
        })
      })
    })

    it("should handle run creation errors gracefully", async () => {
      vi.mocked(storage.getDefinitions).mockResolvedValue(mockDefinitions)
      vi.mocked(storage.createRun).mockRejectedValue(new Error("Run creation failed"))

      render(<DefinitionsPage />)

      // Wait for definitions to load
      await waitFor(() => {
        expect(screen.getByText("Frontend Tests")).toBeInTheDocument()
      })

      // Find and click run button
      const runButtons = screen.getAllByText("Run")
      await userEvent.click(runButtons[0])

      // Wait for error handling
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Error starting test",
          description: "Failed to create the test run.",
          variant: "destructive",
        })
      })
    })
  })
})