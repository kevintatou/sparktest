"use client"

import { useMemo } from "react"
import { useDashboardMetrics } from "./useDashboardMetrics"
import { LoadingState } from "./LoadingState"
import { Card, CardContent } from "@/components/ui/card"
import {
  CheckCircle2,
  XCircle,
  TrendingUp,
} from "lucide-react"

export function DashboardMetrics() {
  const { metrics, loading } = useDashboardMetrics()

  const metricsData = useMemo(() => {
    const passRate = metrics.totalRuns > 0 ? (metrics.completedRuns / metrics.totalRuns) * 100 : 0
    
    return [
      {
        title: "Pass Rate",
        value: `${Math.round(passRate)}%`,
        subtitle: `${metrics.completedRuns} of ${metrics.totalRuns} tests passed`,
        trend: metrics.completedRuns > metrics.failedRuns ? "+5%" : "-3%",
        color: "emerald",
        icon: CheckCircle2,
      },
      {
        title: "Failed Runs",
        value: metrics.failedRuns.toString(),
        subtitle: `${metrics.runningRuns} currently running`,
        trend: metrics.failedRuns > 0 ? "+1" : "0",
        color: "red",
        icon: XCircle,
      },
      {
        title: "Total Runs",
        value: metrics.totalRuns.toString(),
        subtitle: `${metrics.totalDefinitions} definitions • ${metrics.totalExecutors} executors`,
        trend: `+${Math.max(0, metrics.totalRuns - 10)}`,
        color: "blue",
        icon: TrendingUp,
      },
    ]
  }, [metrics])

  if (loading) {
    return <LoadingState />
  }

  return (
    <section className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        {metricsData.map((metric) => {
          const Icon = metric.icon
          return (
            <Card key={metric.title} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-bold">{metric.value}</p>
                      <span
                        className={`text-sm font-medium ${
                          metric.color === "emerald"
                            ? "text-emerald-600"
                            : metric.color === "red"
                              ? "text-red-600"
                              : "text-blue-600"
                        }`}
                      >
                        {metric.trend}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{metric.subtitle}</p>
                  </div>
                  <div
                    className={`p-3 rounded-full ${
                      metric.color === "emerald"
                        ? "bg-emerald-100 dark:bg-emerald-950/50"
                        : metric.color === "red"
                          ? "bg-red-100 dark:bg-red-950/50"
                          : "bg-blue-100 dark:bg-blue-950/50"
                    }`}
                  >
                    <Icon
                      className={`h-6 w-6 ${
                        metric.color === "emerald"
                          ? "text-emerald-600"
                          : metric.color === "red"
                            ? "text-red-600"
                            : "text-blue-600"
                      }`}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Status dots */}
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
          <span className="text-muted-foreground">{metrics.completedRuns} Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-red-500"></div>
          <span className="text-muted-foreground">{metrics.failedRuns} Failed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-blue-500"></div>
          <span className="text-muted-foreground">{metrics.runningRuns} Running</span>
        </div>
      </div>
    </section>
  )
}

// Re-export for backward compatibility
export default DashboardMetrics
