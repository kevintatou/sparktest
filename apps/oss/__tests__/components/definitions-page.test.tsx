import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { storage } from "@sparktest/core/storage"
import DefinitionsPage from "../../app/definitions/page"
import type { Definition } from "@sparktest/core/types"

// Mock the storage module
vi.mock("@sparktest/core/storage", () => ({
  storage: {
    getDefinitions: vi.fn(),
    deleteDefinition: vi.fn(),
    createRun: vi.fn(),
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
  id: "test-def-1",
  name: "Test Definition 1",
  description: "A test definition for testing",
  image: "node:18",
  commands: ["npm test"],
  createdAt: "2023-01-01T00:00:00.000Z",
  executorId: "executor-1",
  source: "https://github.com/example/repo",
  labels: ["unit", "api"],
}

describe("DefinitionsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders empty state when no definitions are available", async () => {
    vi.mocked(storage.getDefinitions).mockResolvedValue([])

    render(<DefinitionsPage />)

    await waitFor(() => {
      expect(screen.getByText("Test Definitions")).toBeInTheDocument()
    })

    expect(screen.getByText("No test definitions yet")).toBeInTheDocument()
    expect(screen.getByText("Create your first test definition to get started.")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /Create Definition/i })).toBeInTheDocument()
  })

  it("renders definitions when available", async () => {
    vi.mocked(storage.getDefinitions).mockResolvedValue([mockDefinition])

    render(<DefinitionsPage />)

    await waitFor(() => {
      expect(screen.getByText("Test Definition 1")).toBeInTheDocument()
    })

    expect(screen.getByText("A test definition for testing")).toBeInTheDocument()
    expect(screen.getByText("node:18")).toBeInTheDocument()
    expect(screen.getByText("npm test")).toBeInTheDocument()
    expect(screen.getByText("executor-1")).toBeInTheDocument()
    expect(screen.getByText("unit")).toBeInTheDocument()
    expect(screen.getByText("api")).toBeInTheDocument()
    expect(screen.getByText("GitHub")).toBeInTheDocument()
  })

  it("filters definitions based on search query", async () => {
    const definitions = [
      mockDefinition,
      {
        ...mockDefinition,
        id: "test-def-2",
        name: "Another Test",
        description: "Different description",
      },
    ]
    vi.mocked(storage.getDefinitions).mockResolvedValue(definitions)

    render(<DefinitionsPage />)

    await waitFor(() => {
      expect(screen.getByText("Test Definition 1")).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText("Search definitions...")
    fireEvent.change(searchInput, { target: { value: "Another" } })

    await waitFor(() => {
      expect(screen.getByText("Another Test")).toBeInTheDocument()
      expect(screen.queryByText("Test Definition 1")).not.toBeInTheDocument()
    })
  })

  it("shows no results message when search yields no matches", async () => {
    vi.mocked(storage.getDefinitions).mockResolvedValue([mockDefinition])

    render(<DefinitionsPage />)

    await waitFor(() => {
      expect(screen.getByText("Test Definition 1")).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText("Search definitions...")
    fireEvent.change(searchInput, { target: { value: "nonexistent" } })

    await waitFor(() => {
      expect(screen.getByText("No definitions match your search")).toBeInTheDocument()
      expect(screen.getByText("Try adjusting your search terms.")).toBeInTheDocument()
    })
  })

  it("calls createRun when Run button is clicked", async () => {
    vi.mocked(storage.getDefinitions).mockResolvedValue([mockDefinition])
    vi.mocked(storage.createRun).mockResolvedValue({
      id: "run-1",
      name: "Test Run",
      image: "node:18",
      command: ["npm test"],
      definitionId: "test-def-1",
      status: "running",
      createdAt: "2023-01-01T00:00:00.000Z",
    })

    render(<DefinitionsPage />)

    await waitFor(() => {
      expect(screen.getByText("Test Definition 1")).toBeInTheDocument()
    })

    const runButton = screen.getByRole("button", { name: /Run/i })
    fireEvent.click(runButton)

    await waitFor(() => {
      expect(storage.createRun).toHaveBeenCalledWith("test-def-1")
    })
  })

  it("calls deleteDefinition when delete button is clicked", async () => {
    vi.mocked(storage.getDefinitions).mockResolvedValue([mockDefinition])
    vi.mocked(storage.deleteDefinition).mockResolvedValue(undefined)

    render(<DefinitionsPage />)

    await waitFor(() => {
      expect(screen.getByText("Test Definition 1")).toBeInTheDocument()
    })

    // Find delete button by its red styling and SVG
    const deleteButtons = screen.getAllByRole("button")
    const deleteButton = deleteButtons.find(button => 
      button.className.includes("text-red-600")
    )
    
    expect(deleteButton).toBeDefined()
    fireEvent.click(deleteButton!)

    await waitFor(() => {
      expect(storage.deleteDefinition).toHaveBeenCalledWith("test-def-1")
    })
  })

  it("shows loading state when deleting", async () => {
    vi.mocked(storage.getDefinitions).mockResolvedValue([mockDefinition])
    vi.mocked(storage.deleteDefinition).mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    )

    render(<DefinitionsPage />)

    await waitFor(() => {
      expect(screen.getByText("Test Definition 1")).toBeInTheDocument()
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
    vi.mocked(storage.getDefinitions).mockResolvedValue([mockDefinition])

    render(<DefinitionsPage />)

    await waitFor(() => {
      expect(screen.getByText("Test Definition 1")).toBeInTheDocument()
    })

    // Check for New Definition link
    expect(screen.getByRole("link", { name: /New Definition/i })).toHaveAttribute(
      "href",
      "/definitions/new"
    )

    // Check for Edit link by finding all links and filtering by href
    const allLinks = screen.getAllByRole("link")
    const editLink = allLinks.find(link => 
      link.getAttribute("href") === "/definitions/edit/test-def-1"
    )
    expect(editLink).toBeTruthy()
  })

  it("displays external source link correctly", async () => {
    vi.mocked(storage.getDefinitions).mockResolvedValue([mockDefinition])

    render(<DefinitionsPage />)

    await waitFor(() => {
      expect(screen.getByText("Test Definition 1")).toBeInTheDocument()
    })

    const githubLink = screen.getByRole("link", { name: /GitHub/i })
    expect(githubLink).toHaveAttribute("href", "https://github.com/example/repo")
    expect(githubLink).toHaveAttribute("target", "_blank")
    expect(githubLink).toHaveAttribute("rel", "noopener noreferrer")
  })
})