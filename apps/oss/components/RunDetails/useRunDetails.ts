"use client"

import { useState, useEffect, useCallback } from "react"
import { useDefinition, useExecutor } from "@/hooks/use-queries"
import type { Run, Definition, Executor } from "@tatou/core/types"

interface UseRunDetailsProps {
  run: Run
}

export interface UseRunDetailsReturn {
  activeRun: Run
  definition: Definition | undefined
  executor: Executor | undefined
  loading: boolean
  safeDate: (date: string | null) => Date
  formatDate: (date: string | null) => string
  copyToClipboard: (text: string) => void
}

export function useRunDetails({ run }: UseRunDetailsProps): UseRunDetailsReturn {
  const [activeRun, setActiveRun] = useState<Run>(run)

  // Fetch related data
  const { data: definition, isLoading: definitionLoading } = useDefinition(run.definitionId || "")
  const { data: executor, isLoading: executorLoading } = useExecutor(run.executorId || "")

  const loading = definitionLoading || executorLoading

  // Update active run when prop changes
  useEffect(() => {
    setActiveRun(run)
  }, [run])

  const safeDate = useCallback((date: string | null): Date => {
    if (!date) return new Date()
    const parsed = new Date(date)
    return isNaN(parsed.getTime()) ? new Date() : parsed
  }, [])

  const formatDate = useCallback(
    (date: string | null): string => {
      if (!date) return "N/A"
      try {
        return new Intl.DateTimeFormat("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZoneName: "short",
        }).format(safeDate(date))
      } catch {
        return "Invalid Date"
      }
    },
    [safeDate]
  )

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // Could add a toast notification here if needed
      console.log("Copied to clipboard:", text)
    } catch (err) {
      console.error("Failed to copy to clipboard:", err)
      // Fallback method
      const textArea = document.createElement("textarea")
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      try {
        document.execCommand("copy")
      } catch (fallbackErr) {
        console.error("Fallback copy also failed:", fallbackErr)
      }
      document.body.removeChild(textArea)
    }
  }, [])

  return {
    activeRun,
    definition,
    executor,
    loading,
    safeDate,
    formatDate,
    copyToClipboard,
  }
}
