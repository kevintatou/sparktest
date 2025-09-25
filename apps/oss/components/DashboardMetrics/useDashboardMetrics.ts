import { useRuns } from "@/hooks/use-queries"
import { useMemo } from "react"
import type { Run } from "@tatou/core/types"

export interface DashboardMetrics {
  totalRuns: number
  completedRuns: number
  failedRuns: number
  runningRuns: number
}

export function useDashboardMetrics() {
  const { data: runs = [], isLoading } = useRuns()

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
    }
  }, [runs])

  return {
    metrics,
    loading: isLoading,
  }
}