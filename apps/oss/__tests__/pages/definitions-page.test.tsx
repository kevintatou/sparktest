import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { vi, describe, it, expect, beforeEach } from "vitest"
import DefinitionsPage from "@/app/definitions/page"
import { storage } from "@tatou/storage-service"
import type { Definition } from "@tatou/core/types"

// Mock the storage service
vi.mock("@tatou/storage-service", () => ({
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

// Mock Next.js Link component
vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

// Mock formatDistanceToNow
vi.mock("@tatou/core", () => ({
  formatDistanceToNow: vi.fn(() => "2 hours ago"),
}))

const mockDefinitions: Definition[] = [
  {
    id: "def-1",
    name: "API Tests",
    description: "Test suite for API endpoints",
    image: "postman/newman",
    commands: ["newman", "run", "collection.json"],
    createdAt: "2024-01-15T10:00:00Z",
    executorId: "postman-executor",
    labels: ["api", "integration"],
    source: "https://github.com/example/tests",
  },
  {
    id: "def-2",
    name: "E2E Tests",
    description: "End-to-end testing with Playwright",
    image: "playwright",
    commands: ["npx", "playwright", "test"],
    createdAt: "2024-01-14T15:30:00Z",
    executorId: "playwright-executor",
    labels: ["e2e", "frontend"],
  },
]

describe("DefinitionsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders the page title and description", async () => {
    vi.mocked(storage.getDefinitions).mockResolvedValue(mockDefinitions)

    render(<DefinitionsPage />)

    await waitFor(() => {
      expect(screen.getByText("Definitions")).toBeInTheDocument()
      expect(screen.getByText("Manage your reusable test blueprints")).toBeInTheDocument()
    })
  })

  it("displays the New Definition button", async () => {
    vi.mocked(storage.getDefinitions).mockResolvedValue(mockDefinitions)

    render(<DefinitionsPage />)

    await waitFor(() => {
      const newButton = screen.getByRole("link", { name: /new definition/i })
      expect(newButton).toBeInTheDocument()
      expect(newButton).toHaveAttribute("href", "/definitions/new")
    })
  })

  it("renders search input", async () => {
    vi.mocked(storage.getDefinitions).mockResolvedValue(mockDefinitions)

    render(<DefinitionsPage />)

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText("Search definitions...")
      expect(searchInput).toBeInTheDocument()
    })
  })

  it("displays definitions when data is available", async () => {
    vi.mocked(storage.getDefinitions).mockResolvedValue(mockDefinitions)

    render(<DefinitionsPage />)

    await waitFor(() => {
      expect(screen.getByText("API Tests")).toBeInTheDocument()
      expect(screen.getByText("E2E Tests")).toBeInTheDocument()
    })

    expect(screen.getByText("Test suite for API endpoints")).toBeInTheDocument()
    expect(screen.getByText("End-to-end testing with Playwright")).toBeInTheDocument()
  })

  it("shows empty state when no definitions exist", async () => {
    vi.mocked(storage.getDefinitions).mockResolvedValue([])

    render(<DefinitionsPage />)

    await waitFor(() => {
      expect(screen.getByText("No definitions yet")).toBeInTheDocument()
    })

    expect(screen.getByText("Create your first definition to get started.")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /create definition/i })).toBeInTheDocument()
  })

  it("filters definitions based on search query", async () => {
    vi.mocked(storage.getDefinitions).mockResolvedValue(mockDefinitions)

    render(<DefinitionsPage />)

    await waitFor(() => {
      expect(screen.getByText("API Tests")).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText("Search definitions...")
    fireEvent.change(searchInput, { target: { value: "API" } })

    expect(screen.getByText("API Tests")).toBeInTheDocument()
    expect(screen.queryByText("E2E Tests")).not.toBeInTheDocument()
  })

  it("shows no results message when search yields no matches", async () => {
    vi.mocked(storage.getDefinitions).mockResolvedValue(mockDefinitions)

    render(<DefinitionsPage />)

    await waitFor(() => {
      expect(screen.getByText("API Tests")).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText("Search definitions...")
    fireEvent.change(searchInput, { target: { value: "nonexistent" } })

    expect(screen.getByText("No definitions match your search")).toBeInTheDocument()
    expect(screen.getByText("Try adjusting your search terms.")).toBeInTheDocument()
  })

  it("displays definition details correctly", async () => {
    vi.mocked(storage.getDefinitions).mockResolvedValue(mockDefinitions)

    render(<DefinitionsPage />)

    await waitFor(() => {
      expect(screen.getByText("API Tests")).toBeInTheDocument()
    })

    // Check definition details
    expect(screen.getByText("postman/newman")).toBeInTheDocument()
    expect(screen.getByText("newman, run, collection.json")).toBeInTheDocument()
    expect(screen.getByText("postman-executor")).toBeInTheDocument()

    // Check labels
    expect(screen.getByText("api")).toBeInTheDocument()
    expect(screen.getByText("integration")).toBeInTheDocument()

    // Check GitHub source link
    const githubLink = screen.getByRole("link", { name: /github/i })
    expect(githubLink).toHaveAttribute("href", "https://github.com/example/tests")
  })

  it("renders action buttons for each definition", async () => {
    vi.mocked(storage.getDefinitions).mockResolvedValue(mockDefinitions)

    render(<DefinitionsPage />)

    await waitFor(() => {
      expect(screen.getByText("API Tests")).toBeInTheDocument()
    })

    // Check for Run buttons
    const runButtons = screen.getAllByRole("button", { name: /run/i })
    expect(runButtons).toHaveLength(2)

    // Check for Delete buttons (they contain trash icon)
    const deleteButtons = screen.getAllByRole("button")
    const trashButtons = deleteButtons.filter(
      (btn) => btn.querySelector("svg") && !btn.textContent?.includes("Run")
    )
    expect(trashButtons.length).toBeGreaterThan(0)
  })

  it("opens delete modal when delete button is clicked", async () => {
    vi.mocked(storage.getDefinitions).mockResolvedValue(mockDefinitions)

    render(<DefinitionsPage />)

    await waitFor(() => {
      expect(screen.getByText("API Tests")).toBeInTheDocument()
    })

    // Find and click delete button for first definition
    const deleteButtons = screen.getAllByRole("button")
    const deleteButton = deleteButtons.find(
      (btn) => btn.querySelector("svg") && !btn.textContent?.includes("Run")
    )

    if (deleteButton) {
      fireEvent.click(deleteButton)

      await waitFor(() => {
        expect(screen.getByText("Delete Definition")).toBeInTheDocument()
        expect(
          screen.getByText(/Are you sure you want to delete this definition/)
        ).toBeInTheDocument()
      })
    }
  })

  it("calls createRun when Run button is clicked", async () => {
    vi.mocked(storage.getDefinitions).mockResolvedValue(mockDefinitions)
    vi.mocked(storage.createRun).mockResolvedValue({
      id: "test-run-id",
      name: "Test Run",
      image: "test-image",
      command: ["test"],
      status: "running",
      createdAt: new Date().toISOString(),
      definitionId: "def-1",
    })

    render(<DefinitionsPage />)

    await waitFor(() => {
      expect(screen.getByText("API Tests")).toBeInTheDocument()
    })

    const runButtons = screen.getAllByRole("button", { name: /run/i })
    fireEvent.click(runButtons[0])

    await waitFor(() => {
      expect(storage.createRun).toHaveBeenCalledWith("def-1")
    })
  })

  it("handles delete confirmation correctly", async () => {
    vi.mocked(storage.getDefinitions).mockResolvedValue(mockDefinitions)
    vi.mocked(storage.deleteDefinition).mockResolvedValue(true)

    render(<DefinitionsPage />)

    await waitFor(() => {
      expect(screen.getByText("API Tests")).toBeInTheDocument()
    })

    // Click delete button
    const deleteButtons = screen.getAllByRole("button")
    const deleteButton = deleteButtons.find(
      (btn) => btn.querySelector("svg") && !btn.textContent?.includes("Run")
    )

    if (deleteButton) {
      fireEvent.click(deleteButton)

      await waitFor(() => {
        expect(screen.getByText("Delete Definition")).toBeInTheDocument()
      })

      // Click confirm delete
      const confirmButton = screen.getByRole("button", { name: /delete/i })
      fireEvent.click(confirmButton)

      await waitFor(() => {
        expect(storage.deleteDefinition).toHaveBeenCalled()
      })
    }
  })

  it("displays creation time", async () => {
    vi.mocked(storage.getDefinitions).mockResolvedValue(mockDefinitions)

    render(<DefinitionsPage />)

    await waitFor(() => {
      expect(screen.getAllByText("Created 2 hours ago")).toHaveLength(2)
    })
  })
})
