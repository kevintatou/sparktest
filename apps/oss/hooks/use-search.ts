"use client"

import { useState, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useDefinitions, useRuns, useExecutors } from "./use-queries"

export interface SearchResult {
  id: string
  title: string
  description: string
  type: "definition" | "run" | "executor"
  status?: string
  url: string
}

export interface UseSearchReturn {
  searchQuery: string
  setSearchQuery: (query: string) => void
  searchResults: SearchResult[]
  isSearching: boolean
  handleSearchSelect: (result: SearchResult) => void
}

export function useSearch(): UseSearchReturn {
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  const { data: definitions = [], isLoading: definitionsLoading } = useDefinitions()
  const { data: runs = [], isLoading: runsLoading } = useRuns()
  const { data: executors = [], isLoading: executorsLoading } = useExecutors()

  const isSearching = definitionsLoading || runsLoading || executorsLoading

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []

    const query = searchQuery.toLowerCase()
    const results: SearchResult[] = []

    // Search definitions
    definitions.forEach((def: any) => {
      if (
        def.name?.toLowerCase().includes(query) ||
        def.description?.toLowerCase().includes(query)
      ) {
        results.push({
          id: def.id,
          title: def.name,
          description: def.description,
          type: "definition",
          url: `/definitions/${def.id}`,
        })
      }
    })

    // Search runs
    runs.forEach((run: any) => {
      if (run.name?.toLowerCase().includes(query) || run.status?.toLowerCase().includes(query)) {
        results.push({
          id: run.id,
          title: run.name,
          description: `Status: ${run.status}`,
          type: "run",
          status: run.status,
          url: `/runs/${run.id}`,
        })
      }
    })

    // Search executors
    executors.forEach((executor: any) => {
      if (
        executor.name?.toLowerCase().includes(query) ||
        executor.description?.toLowerCase().includes(query)
      ) {
        results.push({
          id: executor.id,
          title: executor.name,
          description: executor.description,
          type: "executor",
          url: `/executors/${executor.id}`,
        })
      }
    })

    return results.slice(0, 10) // Limit to 10 results
  }, [searchQuery, definitions, runs, executors])

  const handleSearchSelect = useCallback(
    (result: SearchResult) => {
      router.push(result.url)
      setSearchQuery("") // Clear search after selection
    },
    [router]
  )

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    handleSearchSelect,
  }
}
