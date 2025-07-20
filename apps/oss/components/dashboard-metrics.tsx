"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendChart } from "@/components/trend-chart"
import { storage } from "@sparktest/storage-service"
import { CheckCircle, XCircle, Clock, Play } from "lucide-react"

export function DashboardMetrics() {
  const [metrics, setMetrics] = useState({
    totalRuns: 0,
    completedRuns: 0,
    failedRuns: 0,
    runningRuns: 0,
    totalDefinitions: 0,
    totalExecutors: 0,
    passRate: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        setLoading(true)

        // Load all data from storage
        const [runs, definitions, executors] = await Promise.all([
          storage.getRuns(),
          storage.getDefinitions(),
          storage.getExecutors(),
        ])

        // Calculate metrics from real data
        const totalRuns = runs.length
        const completedRuns = runs.filter((r) => r.status === "completed").length
        const failedRuns = runs.filter((r) => r.status === "failed").length
        const runningRuns = runs.filter((r) => r.status === "running").length
        const passRate = totalRuns > 0 ? Math.round((completedRuns / totalRuns) * 100) : 0

        setMetrics({
          totalRuns,
          completedRuns,
          failedRuns,
          runningRuns,
          totalDefinitions: definitions.length,
          totalExecutors: executors.length,
          passRate,
        })
      } catch (error) {
        console.error("Failed to load metrics:", error)
        // Set default values on error
        setMetrics({
          totalRuns: 0,
          completedRuns: 0,
          failedRuns: 0,
          runningRuns: 0,
          totalDefinitions: 0,
          totalExecutors: 0,
          passRate: 0,
        })
      } finally {
        setLoading(false)
      }
    }

    loadMetrics()

    // Refresh metrics every 30 seconds for real-time updates
    const interval = setInterval(loadMetrics, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold mb-1">Test Execution Overview</h2>
          <p className="text-sm text-muted-foreground">Loading metrics...</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-slate-200 rounded w-20"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-slate-200 rounded w-16 mb-2"></div>
                <div className="h-3 bg-slate-200 rounded w-24"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-lg sm:text-xl font-semibold mb-1">Test Execution Overview</h2>
        <p className="text-sm text-muted-foreground">Real-time metrics from your test data</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Pass Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-green-700 dark:text-green-300">{metrics.passRate}%</div>
            <p className="text-xs text-green-600 dark:text-green-400">
              {metrics.completedRuns} of {metrics.totalRuns} tests passed
            </p>
            <div className="mt-3">
              <TrendChart data={[65, 70, 75, 80, 85, 90, metrics.passRate]} color="green" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20 border-red-200 dark:border-red-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-700 dark:text-red-300">Failed Runs</CardTitle>
            <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-red-700 dark:text-red-300">{metrics.failedRuns}</div>
            <p className="text-xs text-red-600 dark:text-red-400">
              {metrics.runningRuns > 0 ? `${metrics.runningRuns} currently running` : "No tests running"}
            </p>
            <div className="mt-3">
              <TrendChart data={[12, 8, 15, 6, 9, 4, metrics.failedRuns]} color="red" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800 sm:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Runs</CardTitle>
            <Play className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-blue-700 dark:text-blue-300">{metrics.totalRuns}</div>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              <span className="hidden sm:inline">
                {metrics.totalDefinitions} definitions • {metrics.totalExecutors} executors
              </span>
              <span className="sm:hidden">
                {metrics.totalDefinitions} defs • {metrics.totalExecutors} execs
              </span>
            </p>
            <div className="mt-3">
              <TrendChart data={[45, 52, 48, 61, 55, 67, metrics.totalRuns]} color="blue" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Badge
          variant="outline"
          className="bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800 text-xs"
        >
          <CheckCircle className="w-3 h-3 mr-1" />
          {metrics.completedRuns} Completed
        </Badge>
        <Badge
          variant="outline"
          className="bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800 text-xs"
        >
          <XCircle className="w-3 h-3 mr-1" />
          {metrics.failedRuns} Failed
        </Badge>
        {metrics.runningRuns > 0 && (
          <Badge
            variant="outline"
            className="bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 text-xs"
          >
            <Clock className="w-3 h-3 mr-1" />
            {metrics.runningRuns} Running
          </Badge>
        )}
      </div>
    </div>
  )
}
