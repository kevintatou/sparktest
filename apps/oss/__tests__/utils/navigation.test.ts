import { describe, it, expect } from "vitest"
import { isActiveRoute, getTooltipClasses } from "@/lib/utils/navigation"

describe("Navigation Utils", () => {
  describe("isActiveRoute", () => {
    it("should return true for exact match on root", () => {
      expect(isActiveRoute("/", "/")).toBe(true)
    })

    it("should return false for non-root paths on root", () => {
      expect(isActiveRoute("/runs", "/")).toBe(false)
    })

    it("should return true for matching path prefix", () => {
      expect(isActiveRoute("/runs/123", "/runs")).toBe(true)
    })

    it("should return false for non-matching paths", () => {
      expect(isActiveRoute("/definitions", "/runs")).toBe(false)
    })
  })

  describe("getTooltipClasses", () => {
    it("should return visible classes when isVisible is true", () => {
      const classes = getTooltipClasses(true)
      expect(classes).toContain("opacity-100")
    })

    it("should return hover classes when not visible and hasHover is true", () => {
      const classes = getTooltipClasses(false, true)
      expect(classes).toContain("opacity-0 group-hover:opacity-100")
    })

    it("should return hidden classes when not visible and hasHover is false", () => {
      const classes = getTooltipClasses(false, false)
      expect(classes).toContain("opacity-0")
      expect(classes).not.toContain("group-hover:opacity-100")
    })
  })
})
