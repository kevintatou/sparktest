import { describe, it, expect, vi, beforeEach } from "vitest"
import { cn } from "@/lib/utils"
import { formatDate, formatDistanceToNow, getFromStorage, setToStorage } from "@tatou/core"

describe("utils", () => {
  describe("cn", () => {
    it("should merge class names", () => {
      const result = cn("bg-red-500", "text-white")
      expect(result).toContain("bg-red-500")
      expect(result).toContain("text-white")
    })

    it("should handle conditional classes", () => {
      const result = cn("bg-red-500", false && "hidden", "text-white")
      expect(result).toContain("bg-red-500")
      expect(result).toContain("text-white")
      expect(result).not.toContain("hidden")
    })

    it("should merge conflicting tailwind classes", () => {
      const result = cn("bg-red-500", "bg-blue-500")
      expect(result).toBe("bg-blue-500")
    })
  })

  describe("formatDate", () => {
    it("should format date string correctly", () => {
      const dateString = "2023-12-25T10:30:00Z"
      const result = formatDate(dateString)
      
      // Should contain basic components (timezone-agnostic)
      expect(result).toMatch(/Dec|12/)
      expect(result).toMatch(/25/)
      expect(result).toMatch(/2023/)
      // Time should be formatted correctly (allowing for timezone differences)
      expect(result).toMatch(/\d{1,2}:\d{2}/)
      expect(result).toMatch(/AM|PM/)
    })

    it("should handle ISO date strings", () => {
      const dateString = "2023-01-01T00:00:00.000Z"
      const result = formatDate(dateString)
      
      expect(result).toMatch(/Jan|1/)
      expect(result).toMatch(/2023/)
    })
  })

  describe("formatDistanceToNow", () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it("should format seconds correctly", () => {
      const now = new Date("2023-12-25T10:30:00Z")
      vi.setSystemTime(now)
      
      const thirtySecondsAgo = new Date("2023-12-25T10:29:30Z").toISOString()
      const result = formatDistanceToNow(thirtySecondsAgo)
      
      expect(result).toBe("30 seconds ago")
    })

    it("should format minutes correctly", () => {
      const now = new Date("2023-12-25T10:30:00Z")
      vi.setSystemTime(now)
      
      const fiveMinutesAgo = new Date("2023-12-25T10:25:00Z").toISOString()
      const result = formatDistanceToNow(fiveMinutesAgo)
      
      expect(result).toBe("5 minutes ago")
    })

    it("should format single minute correctly", () => {
      const now = new Date("2023-12-25T10:30:00Z")
      vi.setSystemTime(now)
      
      const oneMinuteAgo = new Date("2023-12-25T10:29:00Z").toISOString()
      const result = formatDistanceToNow(oneMinuteAgo)
      
      expect(result).toBe("1 minute ago")
    })

    it("should format hours correctly", () => {
      const now = new Date("2023-12-25T10:30:00Z")
      vi.setSystemTime(now)
      
      const threeHoursAgo = new Date("2023-12-25T07:30:00Z").toISOString()
      const result = formatDistanceToNow(threeHoursAgo)
      
      expect(result).toBe("3 hours ago")
    })

    it("should format single hour correctly", () => {
      const now = new Date("2023-12-25T10:30:00Z")
      vi.setSystemTime(now)
      
      const oneHourAgo = new Date("2023-12-25T09:30:00Z").toISOString()
      const result = formatDistanceToNow(oneHourAgo)
      
      expect(result).toBe("1 hour ago")
    })

    it("should format days correctly", () => {
      const now = new Date("2023-12-25T10:30:00Z")
      vi.setSystemTime(now)
      
      const twoDaysAgo = new Date("2023-12-23T10:30:00Z").toISOString()
      const result = formatDistanceToNow(twoDaysAgo)
      
      expect(result).toBe("2 days ago")
    })

    it("should format single day correctly", () => {
      const now = new Date("2023-12-25T10:30:00Z")
      vi.setSystemTime(now)
      
      const oneDayAgo = new Date("2023-12-24T10:30:00Z").toISOString()
      const result = formatDistanceToNow(oneDayAgo)
      
      expect(result).toBe("1 day ago")
    })
  })

  describe("storage utilities", () => {
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    }

    beforeEach(() => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
        writable: true
      })
      vi.clearAllMocks()
    })

    describe("getFromStorage", () => {
      it("should return parsed value from localStorage", () => {
        const mockValue = { test: "data" }
        localStorageMock.getItem.mockReturnValue(JSON.stringify(mockValue))

        const result = getFromStorage("test-key", {})

        expect(localStorageMock.getItem).toHaveBeenCalledWith("test-key")
        expect(result).toEqual(mockValue)
      })

      it("should return default value when localStorage is empty", () => {
        localStorageMock.getItem.mockReturnValue(null)
        const defaultValue = { default: true }

        const result = getFromStorage("test-key", defaultValue)

        expect(result).toEqual(defaultValue)
      })

      it("should return default value when JSON parsing fails", () => {
        localStorageMock.getItem.mockReturnValue("invalid-json")
        const defaultValue = { default: true }

        const result = getFromStorage("test-key", defaultValue)

        expect(result).toEqual(defaultValue)
      })

      it("should return default value when window is undefined", () => {
        const originalWindow = global.window
        // @ts-expect-error - Testing undefined window
        delete global.window

        const defaultValue = { default: true }
        const result = getFromStorage("test-key", defaultValue)

        expect(result).toEqual(defaultValue)

        global.window = originalWindow
      })
    })

    describe("setToStorage", () => {
      it("should save value to localStorage", () => {
        const value = { test: "data" }

        setToStorage("test-key", value)

        expect(localStorageMock.setItem).toHaveBeenCalledWith("test-key", JSON.stringify(value))
      })

      it("should handle errors gracefully", () => {
        const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})
        localStorageMock.setItem.mockImplementation(() => {
          throw new Error("Storage full")
        })

        const value = { test: "data" }
        setToStorage("test-key", value)

        expect(consoleSpy).toHaveBeenCalledWith("Failed to save to localStorage:", expect.any(Error))
        consoleSpy.mockRestore()
      })

      it("should do nothing when window is undefined", () => {
        const originalWindow = global.window
        // @ts-expect-error - Testing undefined window
        delete global.window

        const value = { test: "data" }
        setToStorage("test-key", value)

        expect(localStorageMock.setItem).not.toHaveBeenCalled()

        global.window = originalWindow
      })
    })
  })
})