import { describe, it, expect } from 'vitest'
import { NAVIGATION_ITEMS, CREATE_OPTIONS } from '@/lib/navigation'

describe('Navigation Constants', () => {
  describe('NAVIGATION_ITEMS', () => {
    it('should contain all expected navigation items', () => {
      expect(NAVIGATION_ITEMS).toHaveLength(5)
      
      const expectedItems = [
        { name: "Dashboard", href: "/" },
        { name: "Runs", href: "/runs" },
        { name: "Definitions", href: "/definitions" },
        { name: "Suites", href: "/suites" },
        { name: "Executors", href: "/executors" },
      ]
      
      expectedItems.forEach((expected, index) => {
        expect(NAVIGATION_ITEMS[index].name).toBe(expected.name)
        expect(NAVIGATION_ITEMS[index].href).toBe(expected.href)
        expect(NAVIGATION_ITEMS[index].icon).toBeDefined()
      })
    })

    it('should have unique hrefs', () => {
      const hrefs = NAVIGATION_ITEMS.map(item => item.href)
      const uniqueHrefs = new Set(hrefs)
      expect(uniqueHrefs.size).toBe(hrefs.length)
    })
  })

  describe('CREATE_OPTIONS', () => {
    it('should contain all expected create options', () => {
      expect(CREATE_OPTIONS).toHaveLength(4)
      
      const expectedOptions = [
        { name: "New Run", href: "/runs/new" },
        { name: "New Definition", href: "/definitions/new" },
        { name: "New Suite", href: "/suites/new" },
        { name: "New Executor", href: "/executors/new" },
      ]
      
      expectedOptions.forEach((expected, index) => {
        expect(CREATE_OPTIONS[index].name).toBe(expected.name)
        expect(CREATE_OPTIONS[index].href).toBe(expected.href)
        expect(CREATE_OPTIONS[index].icon).toBeDefined()
      })
    })

    it('should have unique hrefs', () => {
      const hrefs = CREATE_OPTIONS.map(option => option.href)
      const uniqueHrefs = new Set(hrefs)
      expect(uniqueHrefs.size).toBe(hrefs.length)
    })
  })
})