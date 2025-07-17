import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useSidebar } from "@/hooks/use-sidebar"

describe("useSidebar", () => {
  beforeEach(() => {
    vi.spyOn(document, "addEventListener")
    vi.spyOn(document, "removeEventListener")
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("should initialize with create menu closed", () => {
    const { result } = renderHook(() => useSidebar())
    expect(result.current.isCreateOpen).toBe(false)
  })

  it("should toggle create menu state", () => {
    const { result } = renderHook(() => useSidebar())

    act(() => {
      result.current.setIsCreateOpen(true)
    })

    expect(result.current.isCreateOpen).toBe(true)
  })

  it("should add event listener when create menu is open", () => {
    const { result } = renderHook(() => useSidebar())

    act(() => {
      result.current.setIsCreateOpen(true)
    })

    expect(document.addEventListener).toHaveBeenCalledWith("mousedown", expect.any(Function))
  })

  it("should remove event listener when create menu is closed", () => {
    const { result } = renderHook(() => useSidebar())

    act(() => {
      result.current.setIsCreateOpen(true)
    })

    act(() => {
      result.current.setIsCreateOpen(false)
    })

    expect(document.removeEventListener).toHaveBeenCalledWith("mousedown", expect.any(Function))
  })
})
