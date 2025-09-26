"use client"

import { useMemo } from "react"
import { useDashboardMetrics } from "./useDashboardMetrics"
import { LoadingState } from "./LoadingState"
import { CheckCircle2, XCircle, TrendingUp } from "lucide-react"

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
        color: "success",
        icon: CheckCircle2,
      },
      {
        title: "Failed",
        value: metrics.failedRuns.toString(),
        subtitle: `${metrics.runningRuns} currently running`,
        trend: metrics.failedRuns > 0 ? "+1" : "0",
        color: "error",
        icon: XCircle,
      },
      {
        title: "Total Runs",
        value: metrics.totalRuns.toString(),
        subtitle: `${metrics.totalDefinitions} definitions • ${metrics.totalExecutors} executors`,
        trend: `+${Math.max(0, metrics.totalRuns - 10)}`,
        color: "neutral",
        icon: TrendingUp,
      },
    ]
  }, [metrics])

  if (loading) {
    return <LoadingState />
  }

  return (
    <section className="space-y-6">
      {/* Metrics cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {metricsData.map((metric) => {
          const Icon = metric.icon
          return (
            <div
              key={metric.title}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm p-6 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {metric.title}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
                      {metric.value}
                    </p>
                    <span
                      className={`text-sm font-medium ${
                        metric.color === "success"
                          ? "text-emerald-600 dark:text-emerald-500"
                          : metric.color === "error"
                            ? "text-rose-600 dark:text-rose-500"
                            : "text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {metric.trend}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 dark:text-slate-500">{metric.subtitle}</p>
                </div>
                <div
                  className={`p-3 rounded-lg ${
                    metric.color === "success"
                      ? "bg-emerald-100 dark:bg-emerald-900/30"
                      : metric.color === "error"
                        ? "bg-rose-100 dark:bg-rose-900/30"
                        : "bg-slate-100 dark:bg-slate-700"
                  }`}
                >
                  <Icon
                    className={`h-6 w-6 ${
                      metric.color === "success"
                        ? "text-emerald-600 dark:text-emerald-500"
                        : metric.color === "error"
                          ? "text-rose-600 dark:text-rose-500"
                          : "text-slate-600 dark:text-slate-400"
                    }`}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Status indicators */}
      <div className="flex items-center gap-8 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
          <span className="text-slate-500 dark:text-slate-400">
            {metrics.completedRuns} Completed
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-rose-500"></div>
          <span className="text-slate-500 dark:text-slate-400">{metrics.failedRuns} Failed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-amber-500"></div>
          <span className="text-slate-500 dark:text-slate-400">{metrics.runningRuns} Running</span>
        </div>
      </div>
    </section>
  )
}

// Re-export for backward compatibility
export default DashboardMetrics
