"use client"

import { useMemo } from "react"
import { useDashboardMetrics } from "./useDashboardMetrics"
import { LoadingState } from "./LoadingState"
import { MetricCard } from "./MetricCard"
import { MetricsSummary } from "./MetricsSummary"
import {
  METRIC_ICONS,
  formatMetricValue,
  generateSubtitle,
  generateMobileSubtitle,
} from "./metricsUtils"

export function DashboardMetrics() {
  const { metrics, loading, trendData } = useDashboardMetrics()

  // Memoize metric card configurations
  const metricCards = useMemo(
    () => [
      {
        id: "passRate",
        title: "Pass Rate",
        value: formatMetricValue(metrics.passRate, "percentage"),
        subtitle: generateSubtitle("passRate", metrics),
        icon: METRIC_ICONS.passRate,
        color: "green" as const,
        trendData: trendData.passRate,
      },
      {
        id: "failedRuns",
        title: "Failed Runs",
        value: formatMetricValue(metrics.failedRuns, "count"),
        subtitle: generateSubtitle("failedRuns", metrics),
        icon: METRIC_ICONS.failedRuns,
        color: "red" as const,
        trendData: trendData.failedRuns,
      },
      {
        id: "totalRuns",
        title: "Total Runs",
        value: formatMetricValue(metrics.totalRuns, "count"),
        subtitle: generateSubtitle("totalRuns", metrics),
        mobileSubtitle: generateMobileSubtitle("totalRuns", metrics),
        icon: METRIC_ICONS.totalRuns,
        color: "blue" as const,
        className: "sm:col-span-2 lg:col-span-1",
        trendData: trendData.totalRuns,
      },
    ],
    [metrics, trendData]
  )

  if (loading) {
    return <LoadingState />
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-lg sm:text-xl font-semibold mb-1">Test Execution Overview</h2>
        <p className="text-sm text-muted-foreground">Real-time metrics from your test data</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metricCards.map((card) => (
          <MetricCard
            key={card.id}
            title={card.title}
            value={card.value}
            subtitle={
              card.id === "totalRuns" ? (
                <>
                  <span className="hidden sm:inline">{card.subtitle}</span>
                  <span className="sm:hidden">{card.mobileSubtitle}</span>
                </>
              ) : (
                card.subtitle
              )
            }
            icon={card.icon}
            color={card.color}
            className={card.className}
            trendData={card.trendData}
          />
        ))}
      </div>

      <MetricsSummary
        completedRuns={metrics.completedRuns}
        failedRuns={metrics.failedRuns}
        runningRuns={metrics.runningRuns}
      />
    </div>
  )
}

// Re-export for backward compatibility
export default DashboardMetrics
