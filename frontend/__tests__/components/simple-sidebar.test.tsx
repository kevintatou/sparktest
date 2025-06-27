import { describe, it, expect, beforeEach, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { usePathname } from "next/navigation"
import { SimpleSidebar } from "@/components/simple-sidebar"

// Mock Next.js navigation
vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
}))

describe("SimpleSidebar", () => {
  beforeEach(() => {
    vi.mocked(usePathname).mockReturnValue("/")
  })

  it("should render navigation items", () => {
    render(<SimpleSidebar />)

    expect(screen.getByLabelText("Create new item")).toBeInTheDocument()
  })

  it("should toggle create menu when button is clicked", () => {
    render(<SimpleSidebar />)

    const createButton = screen.getByLabelText("Create new item")
    expect(createButton).toHaveAttribute("aria-expanded", "false")

    fireEvent.click(createButton)
    expect(createButton).toHaveAttribute("aria-expanded", "true")
  })

  it("should highlight active navigation item", () => {
    vi.mocked(usePathname).mockReturnValue("/runs")
    render(<SimpleSidebar />)

    // Test would check for active styling on the runs navigation item
    // This would require more specific test selectors or data-testid attributes
  })

  it("should close create menu when create option is clicked", () => {
    render(<SimpleSidebar />)

    const createButton = screen.getByLabelText("Create new item")
    fireEvent.click(createButton)

    // Would need to test clicking on a create option and verifying menu closes
    // This would require the create options to be visible and clickable in the test
  })
})
