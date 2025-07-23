import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { vi, describe, it, expect, beforeEach } from "vitest"
import ExecutorsPage from "@/app/executors/page"
import { storage } from "@sparktest/storage-service"
import type { Executor } from "@sparktest/core/types"

// Mock the storage service
vi.mock("@sparktest/storage-service", () => ({
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

// Mock Next.js Link component
vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

// Mock formatDistanceToNow
vi.mock("@sparktest/core", () => ({
  formatDistanceToNow: vi.fn(() => "3 hours ago"),
}))

const mockExecutors: Executor[] = [
  {
    id: "exec-1",
    name: "Postman Newman",
    description: "Run Postman collections with Newman",
    image: "postman/newman:latest",
    command: ["newman", "run"],
    supportedFileTypes: [".json", ".postman_collection"],
    createdAt: "2024-01-15T09:00:00Z",
    env: {
      NODE_ENV: "test",
    },
  },
  {
    id: "exec-2",
    name: "Playwright",
    description: "End-to-end testing with Playwright",
    image: "playwright:latest",
    command: ["npx", "playwright", "test"],
    supportedFileTypes: [".spec.ts", ".test.ts"],
    createdAt: "2024-01-14T14:00:00Z",
  },
]

describe("ExecutorsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders the page title and description", async () => {
    vi.mocked(storage.getExecutors).mockResolvedValue(mockExecutors)

    render(<ExecutorsPage />)

    await waitFor(() => {
      expect(screen.getByText("Executors")).toBeInTheDocument()
      expect(screen.getByText("Manage your reusable test runners")).toBeInTheDocument()
    })
  })

  it("displays the New Executor button", async () => {
    vi.mocked(storage.getExecutors).mockResolvedValue(mockExecutors)

    render(<ExecutorsPage />)

    await waitFor(() => {
      const newButton = screen.getByRole("link", { name: /new executor/i })
      expect(newButton).toBeInTheDocument()
      expect(newButton).toHaveAttribute("href", "/executors/new")
    })
  })

  it("renders search input", async () => {
    vi.mocked(storage.getExecutors).mockResolvedValue(mockExecutors)

    render(<ExecutorsPage />)

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText("Search executors...")
      expect(searchInput).toBeInTheDocument()
    })
  })

  it("displays executors when data is available", async () => {
    vi.mocked(storage.getExecutors).mockResolvedValue(mockExecutors)

    render(<ExecutorsPage />)

    await waitFor(() => {
      expect(screen.getByText("Postman Newman")).toBeInTheDocument()
      expect(screen.getByText("Playwright")).toBeInTheDocument()
    })

    expect(screen.getByText("Run Postman collections with Newman")).toBeInTheDocument()
    expect(screen.getByText("End-to-end testing with Playwright")).toBeInTheDocument()
  })

  it("shows empty state when no executors exist", async () => {
    vi.mocked(storage.getExecutors).mockResolvedValue([])

    render(<ExecutorsPage />)

    await waitFor(() => {
      expect(screen.getByText("No executors yet")).toBeInTheDocument()
    })

    expect(
      screen.getByText("Create your first executor to define reusable test runners.")
    ).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /create executor/i })).toBeInTheDocument()
  })

  it("filters executors based on search query", async () => {
    vi.mocked(storage.getExecutors).mockResolvedValue(mockExecutors)

    render(<ExecutorsPage />)

    await waitFor(() => {
      expect(screen.getByText("Postman Newman")).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText("Search executors...")
    fireEvent.change(searchInput, { target: { value: "Postman" } })

    expect(screen.getByText("Postman Newman")).toBeInTheDocument()
    expect(screen.queryByText("Playwright")).not.toBeInTheDocument()
  })

  it("shows no results message when search yields no matches", async () => {
    vi.mocked(storage.getExecutors).mockResolvedValue(mockExecutors)

    render(<ExecutorsPage />)

    await waitFor(() => {
      expect(screen.getByText("Postman Newman")).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText("Search executors...")
    fireEvent.change(searchInput, { target: { value: "nonexistent" } })

    expect(screen.getByText("No executors match your search")).toBeInTheDocument()
    expect(screen.getByText("Try adjusting your search terms.")).toBeInTheDocument()
  })

  it("displays executor details correctly", async () => {
    vi.mocked(storage.getExecutors).mockResolvedValue(mockExecutors)

    render(<ExecutorsPage />)

    await waitFor(() => {
      expect(screen.getByText("Postman Newman")).toBeInTheDocument()
    })

    // Check executor details
    expect(screen.getByText("postman/newman:latest")).toBeInTheDocument()
    // Check that commands are displayed (there are multiple executors so multiple Command: labels)
    const commandLabels = screen.getAllByText("Command:")
    expect(commandLabels.length).toBeGreaterThan(0)

    // Check supported file types
    expect(screen.getByText(".json")).toBeInTheDocument()
    expect(screen.getByText(".postman_collection")).toBeInTheDocument()
    expect(screen.getByText(".spec.ts")).toBeInTheDocument()
    expect(screen.getByText(".test.ts")).toBeInTheDocument()
  })

  it("renders action buttons for each executor", async () => {
    vi.mocked(storage.getExecutors).mockResolvedValue(mockExecutors)

    render(<ExecutorsPage />)

    await waitFor(() => {
      expect(screen.getByText("Postman Newman")).toBeInTheDocument()
    })

    // Check for View Details buttons
    const viewButtons = screen.getAllByRole("link", { name: /view details/i })
    expect(viewButtons).toHaveLength(2)

    // Check for Delete buttons (they contain trash icon)
    const deleteButtons = screen.getAllByRole("button")
    const trashButtons = deleteButtons.filter((btn) => btn.querySelector("svg"))
    expect(trashButtons.length).toBeGreaterThan(0)
  })

  it("has correct links for View Details buttons", async () => {
    vi.mocked(storage.getExecutors).mockResolvedValue(mockExecutors)

    render(<ExecutorsPage />)

    await waitFor(() => {
      expect(screen.getByText("Postman Newman")).toBeInTheDocument()
    })

    const viewButtons = screen.getAllByRole("link", { name: /view details/i })
    expect(viewButtons[0]).toHaveAttribute("href", "/executors/exec-1")
    expect(viewButtons[1]).toHaveAttribute("href", "/executors/exec-2")
  })

  it("has correct links for Edit buttons", async () => {
    vi.mocked(storage.getExecutors).mockResolvedValue(mockExecutors)

    render(<ExecutorsPage />)

    await waitFor(() => {
      expect(screen.getByText("Postman Newman")).toBeInTheDocument()
    })

    // Edit buttons are icon-only links, we need to find them by their href attribute
    const editLinks = screen
      .getAllByRole("link")
      .filter((link) => link.getAttribute("href")?.includes("/edit/"))
    expect(editLinks).toHaveLength(2)
    expect(editLinks[0]).toHaveAttribute("href", "/executors/edit/exec-1")
    expect(editLinks[1]).toHaveAttribute("href", "/executors/edit/exec-2")
  })

  it("calls deleteExecutor when delete button is clicked", async () => {
    vi.mocked(storage.getExecutors).mockResolvedValue(mockExecutors)
    vi.mocked(storage.deleteExecutor).mockResolvedValue(true)

    render(<ExecutorsPage />)

    await waitFor(() => {
      expect(screen.getByText("Postman Newman")).toBeInTheDocument()
    })

    // Find and click first delete button
    const deleteButtons = screen.getAllByRole("button")
    const deleteButton = deleteButtons.find((btn) => btn.querySelector("svg"))

    if (deleteButton) {
      fireEvent.click(deleteButton)

      await waitFor(() => {
        expect(storage.deleteExecutor).toHaveBeenCalledWith("exec-1")
      })
    }
  })

  it("shows loading state when deleting", async () => {
    vi.mocked(storage.getExecutors).mockResolvedValue(mockExecutors)
    vi.mocked(storage.deleteExecutor).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    )

    render(<ExecutorsPage />)

    await waitFor(() => {
      expect(screen.getByText("Postman Newman")).toBeInTheDocument()
    })

    // Find and click first delete button
    const deleteButtons = screen.getAllByRole("button")
    const deleteButton = deleteButtons.find((btn) => btn.querySelector("svg"))

    if (deleteButton) {
      fireEvent.click(deleteButton)

      // Check for loading spinner
      await waitFor(() => {
        expect(deleteButton.querySelector(".animate-spin")).toBeInTheDocument()
      })
    }
  })

  it("filters executors by description", async () => {
    vi.mocked(storage.getExecutors).mockResolvedValue(mockExecutors)

    render(<ExecutorsPage />)

    await waitFor(() => {
      expect(screen.getByText("Postman Newman")).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText("Search executors...")
    fireEvent.change(searchInput, { target: { value: "End-to-end" } })

    expect(screen.queryByText("Postman Newman")).not.toBeInTheDocument()
    expect(screen.getByText("Playwright")).toBeInTheDocument()
  })

  it("filters executors by ID", async () => {
    vi.mocked(storage.getExecutors).mockResolvedValue(mockExecutors)

    render(<ExecutorsPage />)

    await waitFor(() => {
      expect(screen.getByText("Postman Newman")).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText("Search executors...")
    fireEvent.change(searchInput, { target: { value: "exec-2" } })

    expect(screen.queryByText("Postman Newman")).not.toBeInTheDocument()
    expect(screen.getByText("Playwright")).toBeInTheDocument()
  })

  it("displays creation time", async () => {
    vi.mocked(storage.getExecutors).mockResolvedValue(mockExecutors)

    render(<ExecutorsPage />)

    await waitFor(() => {
      expect(screen.getAllByText("Created 3 hours ago")).toHaveLength(2)
    })
  })

  it("handles executor without supported file types", async () => {
    const executorWithoutFileTypes: Executor[] = [
      {
        id: "exec-3",
        name: "Generic Runner",
        description: "A generic test runner",
        image: "generic:latest",
        createdAt: "2024-01-15T08:00:00Z",
      },
    ]

    vi.mocked(storage.getExecutors).mockResolvedValue(executorWithoutFileTypes)

    render(<ExecutorsPage />)

    await waitFor(() => {
      expect(screen.getByText("Generic Runner")).toBeInTheDocument()
    })

    expect(screen.getByText("A generic test runner")).toBeInTheDocument()
    // Should not display file types section when none exist
    expect(screen.queryByText(".json")).not.toBeInTheDocument()
  })
})
