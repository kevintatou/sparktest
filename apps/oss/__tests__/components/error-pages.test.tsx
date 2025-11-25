import { render, screen, fireEvent } from "../test-utils"
import { vi } from "vitest"
import { ErrorPage } from "@/components/error-page"

describe("Error Pages", () => {
  describe("ErrorPage Component", () => {
    it("renders error message correctly", () => {
      const mockError = new Error("Test error message")
      const mockReset = vi.fn()

      render(
        <ErrorPage
          error={mockError}
          reset={mockReset}
          title="Something went wrong"
          description="An unexpected error occurred."
        />
      )

      expect(screen.getByText("Something went wrong")).toBeInTheDocument()
      expect(screen.getByText("An unexpected error occurred.")).toBeInTheDocument()
    })

    it("calls reset function when Try Again button is clicked", () => {
      const mockError = new Error("Test error")
      const mockReset = vi.fn()

      render(
        <ErrorPage
          error={mockError}
          reset={mockReset}
          title="Error"
          description="Test description"
        />
      )

      fireEvent.click(screen.getByText("Try Again"))

      expect(mockReset).toHaveBeenCalledTimes(1)
    })

    it("provides navigation to home page", () => {
      const mockError = new Error("Test error")
      const mockReset = vi.fn()

      render(
        <ErrorPage
          error={mockError}
          reset={mockReset}
          title="Error"
          description="Test description"
        />
      )

      const homeLink = screen.getByText("Go Home")
      expect(homeLink).toBeInTheDocument()
      expect(homeLink.closest("a")).toHaveAttribute("href", "/")
    })

    it("renders create link when provided", () => {
      const mockError = new Error("Test error")
      const mockReset = vi.fn()

      render(
        <ErrorPage
          error={mockError}
          reset={mockReset}
          title="Error"
          description="Test description"
          createLink={{ href: "/new", label: "Create New Item" }}
        />
      )

      const createLink = screen.getByText("Create New Item")
      expect(createLink).toBeInTheDocument()
      expect(createLink.closest("a")).toHaveAttribute("href", "/new")
    })

    it("does not render create link when not provided", () => {
      const mockError = new Error("Test error")
      const mockReset = vi.fn()

      render(
        <ErrorPage
          error={mockError}
          reset={mockReset}
          title="Error"
          description="Test description"
        />
      )

      expect(screen.queryByText("Create New")).not.toBeInTheDocument()
    })
  })

  describe("Runs Error Page", () => {
    it("renders runs-specific error message", () => {
      const mockError = new Error("Database connection failed")
      const mockReset = vi.fn()

      render(
        <ErrorPage
          error={mockError}
          reset={mockReset}
          title="Failed to load test runs"
          description="Unable to connect to the server."
          createLink={{ href: "/runs/new", label: "Create New Run" }}
        />
      )

      expect(screen.getByText("Failed to load test runs")).toBeInTheDocument()
      expect(screen.getByText(/Unable to connect to the server/)).toBeInTheDocument()
    })

    it("provides navigation to create new run", () => {
      const mockError = new Error("Error")
      const mockReset = vi.fn()

      render(
        <ErrorPage
          error={mockError}
          reset={mockReset}
          title="Failed to load test runs"
          description="Test description"
          createLink={{ href: "/runs/new", label: "Create New Run" }}
        />
      )

      const createLink = screen.getByText("Create New Run")
      expect(createLink).toBeInTheDocument()
      expect(createLink.closest("a")).toHaveAttribute("href", "/runs/new")
    })
  })

  describe("Definitions Error Page", () => {
    it("renders definitions-specific error message", () => {
      const mockError = new Error("Database connection failed")
      const mockReset = vi.fn()

      render(
        <ErrorPage
          error={mockError}
          reset={mockReset}
          title="Failed to load definitions"
          description="Unable to connect to the server."
          createLink={{ href: "/definitions/new", label: "Create New Definition" }}
        />
      )

      expect(screen.getByText("Failed to load definitions")).toBeInTheDocument()
      expect(screen.getByText(/Unable to connect to the server/)).toBeInTheDocument()
    })

    it("provides navigation to create new definition", () => {
      const mockError = new Error("Error")
      const mockReset = vi.fn()

      render(
        <ErrorPage
          error={mockError}
          reset={mockReset}
          title="Failed to load definitions"
          description="Test description"
          createLink={{ href: "/definitions/new", label: "Create New Definition" }}
        />
      )

      const createLink = screen.getByText("Create New Definition")
      expect(createLink).toBeInTheDocument()
      expect(createLink.closest("a")).toHaveAttribute("href", "/definitions/new")
    })
  })

  describe("Error Handling Patterns", () => {
    it("validates that all error configurations have Try Again button", () => {
      const mockError = new Error("Test error")
      const mockReset = vi.fn()

      // Test global error config
      const { unmount: unmount1 } = render(
        <ErrorPage
          error={mockError}
          reset={mockReset}
          title="Something went wrong"
          description="Test"
          icon="alert"
        />
      )
      expect(screen.getByText("Try Again")).toBeInTheDocument()
      unmount1()

      // Test runs error config
      const { unmount: unmount2 } = render(
        <ErrorPage
          error={mockError}
          reset={mockReset}
          title="Failed to load test runs"
          description="Test"
          createLink={{ href: "/runs/new", label: "Create New Run" }}
        />
      )
      expect(screen.getByText("Try Again")).toBeInTheDocument()
      unmount2()

      // Test definitions error config
      render(
        <ErrorPage
          error={mockError}
          reset={mockReset}
          title="Failed to load definitions"
          description="Test"
          createLink={{ href: "/definitions/new", label: "Create New Definition" }}
        />
      )
      expect(screen.getByText("Try Again")).toBeInTheDocument()
    })

    it("validates that all error configurations have Home link", () => {
      const mockError = new Error("Test error")
      const mockReset = vi.fn()

      // Test global error config
      const { unmount: unmount1 } = render(
        <ErrorPage error={mockError} reset={mockReset} title="Test" description="Test" />
      )
      expect(screen.getByText("Go Home").closest("a")).toHaveAttribute("href", "/")
      unmount1()

      // Test runs error config
      const { unmount: unmount2 } = render(
        <ErrorPage
          error={mockError}
          reset={mockReset}
          title="Test"
          description="Test"
          createLink={{ href: "/runs/new", label: "Create" }}
        />
      )
      expect(screen.getByText("Go Home").closest("a")).toHaveAttribute("href", "/")
      unmount2()

      // Test definitions error config
      render(
        <ErrorPage
          error={mockError}
          reset={mockReset}
          title="Test"
          description="Test"
          createLink={{ href: "/definitions/new", label: "Create" }}
        />
      )
      expect(screen.getByText("Go Home").closest("a")).toHaveAttribute("href", "/")
    })
  })
})
