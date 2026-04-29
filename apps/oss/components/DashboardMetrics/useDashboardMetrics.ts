import { useDefinitions, useExecutors, useRuns } from "@/hooks/use-queries"
import { useMemo } from "react"
import type { Run } from "@tatou/core/types"

export interface DashboardMetrics {
  totalRuns: number
  completedRuns: number
  failedRuns: number
  runningRuns: number
  totalDefinitions: number
  totalExecutors: number
}

export function useDashboardMetrics() {
  const { data: runs = [], isLoading } = useRuns()
  const { data: definitions = [], isLoading: definitionsLoading } = useDefinitions()
  const { data: executors = [], isLoading: executorsLoading } = useExecutors()

  const metrics = useMemo(() => {
    const totalRuns = runs.length
    const completedRuns = runs.filter((run: Run) => run.status === "completed").length
    const failedRuns = runs.filter((run: Run) => run.status === "failed").length
    const runningRuns = runs.filter((run: Run) => run.status === "running").length

    return {
      totalRuns,
      completedRuns,
      failedRuns,
      runningRuns,
      totalDefinitions: definitions.length,
      totalExecutors: executors.length,
    }
  }, [runs, definitions, executors])

  return {
    metrics,
    loading: isLoading || definitionsLoading || executorsLoading,
  }
}
