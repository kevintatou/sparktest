"use client"

import { useMemo } from "react"
import { useRuns, useDefinitions, useExecutors } from "./use-queries"
import type { Run } from "@tatou/core/types"

export interface DashboardMetrics {
  totalRuns: number
  successfulRuns: number
  failedRuns: number
  runningRuns: number
  successRate: number
  totalDefinitions: number
  totalExecutors: number
  recentRuns: Array<{
    id: string
    name: string
    status: string
    createdAt: string
  }>
}

export function useDashboardMetrics(): {
  metrics: DashboardMetrics | null
  isLoading: boolean
  error: any
} {
  const { data: runs = [], isLoading: runsLoading, error: runsError } = useRuns()
  const { data: definitions = [], isLoading: definitionsLoading } = useDefinitions()
  const { data: executors = [], isLoading: executorsLoading } = useExecutors()

  const metrics = useMemo((): DashboardMetrics | null => {
    if (runsLoading || definitionsLoading || executorsLoading) {
      return null
    }

    const totalRuns = runs.length
    const successfulRuns = runs.filter((run: Run) => run.status === "completed").length
    const failedRuns = runs.filter((run: Run) => run.status === "failed").length
    const runningRuns = runs.filter((run: Run) => run.status === "running").length
    const successRate = totalRuns > 0 ? (successfulRuns / totalRuns) * 100 : 0

    // Get recent runs (last 10)
    const recentRuns = [...runs]
      .sort((a: Run, b: Run) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
      .map((run: Run) => ({
        id: run.id,
        name: run.name,
        status: run.status,
        createdAt: run.createdAt,
      }))

    return {
      totalRuns,
      successfulRuns,
      failedRuns,
      runningRuns,
      successRate,
      totalDefinitions: definitions.length,
      totalExecutors: executors.length,
      recentRuns,
    }
  }, [runs, definitions, executors, runsLoading, definitionsLoading, executorsLoading])

  return {
    metrics,
    isLoading: runsLoading || definitionsLoading || executorsLoading,
    error: runsError,
  }
}