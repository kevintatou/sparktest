"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { storage } from "@tatou/storage-service"

export interface SearchResult {
  id: string
  name: string
  type: string
  href: string
  description?: string
}

export function useSearch() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const router = useRouter()

  // Search functionality
  useEffect(() => {
    const performSearch = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([])
        return
      }

      setIsSearching(true)
      try {
        const [runs, definitions, executors, suites] = await Promise.all([
          storage.getRuns(),
          storage.getDefinitions(), 
          storage.getExecutors(),
          storage.getTestSuites(),
        ])

        const query = searchQuery.toLowerCase()
        const results: SearchResult[] = []

        // Search runs
        runs.forEach((run) => {
          if (run.name?.toLowerCase().includes(query) || run.id.toLowerCase().includes(query)) {
            results.push({ 
              ...run, 
              type: "run", 
              href: `/runs/${run.id}`,
              name: run.name || run.id
            })
          }
        })

        // Search definitions
        definitions.forEach((def) => {
          if (
            def.name.toLowerCase().includes(query) ||
            def.description?.toLowerCase().includes(query)
          ) {
            results.push({ ...def, type: "definition", href: `/definitions/${def.id}` })
          }
        })

        // Search executors
        executors.forEach((exec) => {
          if (
            exec.name.toLowerCase().includes(query) ||
            exec.description?.toLowerCase().includes(query)
          ) {
            results.push({ ...exec, type: "executor", href: `/executors/${exec.id}` })
          }
        })

        // Search suites
        suites.forEach((suite) => {
          if (
            suite.name.toLowerCase().includes(query) ||
            suite.description?.toLowerCase().includes(query)
          ) {
            results.push({ ...suite, type: "suite", href: `/suites/${suite.id}` })
          }
        })

        setSearchResults(results.slice(0, 8)) // Limit to 8 results
      } catch (error) {
        console.error("Search failed:", error)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }

    const debounceTimer = setTimeout(performSearch, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery])

  const handleSearchSelect = (result: SearchResult) => {
    router.push(result.href)
    setSearchQuery("")
    setSearchResults([])
  }

  const clearSearch = () => {
    setSearchQuery("")
    setSearchResults([])
  }

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    handleSearchSelect,
    clearSearch,
  }
}
