import { CheckCircle, XCircle, Clock, Play } from "lucide-react"

export interface MetricCardProps {
  title: string
  value: string | number
  subtitle: string
  icon: React.ComponentType<{ className?: string }>
  color: "green" | "red" | "blue"
  className?: string
  trendData?: Array<{ date: string; value: number }>
}

export const METRIC_ICONS = {
  passRate: CheckCircle,
  failedRuns: XCircle,
  totalRuns: Play,
  runningRuns: Clock,
} as const

export const COLOR_SCHEMES = {
  green: {
    cardBg:
      "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20",
    border: "border-green-200 dark:border-green-800",
    title: "text-green-700 dark:text-green-300",
    value: "text-green-700 dark:text-green-300",
    subtitle: "text-green-600 dark:text-green-400",
    icon: "text-green-600 dark:text-green-400",
  },
  red: {
    cardBg: "bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20",
    border: "border-red-200 dark:border-red-800",
    title: "text-red-700 dark:text-red-300",
    value: "text-red-700 dark:text-red-300",
    subtitle: "text-red-600 dark:text-red-400",
    icon: "text-red-600 dark:text-red-400",
  },
  blue: {
    cardBg:
      "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20",
    border: "border-blue-200 dark:border-blue-800",
    title: "text-blue-700 dark:text-blue-300",
    value: "text-blue-700 dark:text-blue-300",
    subtitle: "text-blue-600 dark:text-blue-400",
    icon: "text-blue-600 dark:text-blue-400",
  },
} as const

export function formatMetricValue(value: number, type: "percentage" | "count"): string {
  if (type === "percentage") {
    return `${value}%`
  }
  return value.toString()
}

interface MetricsData {
  totalRuns: number
  completedRuns: number
  failedRuns: number
  runningRuns: number
  totalDefinitions: number
  totalExecutors: number
  passRate: number
}

export function generateSubtitle(
  type: "passRate" | "failedRuns" | "totalRuns",
  metrics: MetricsData
): string {
  switch (type) {
    case "passRate":
      return `${metrics.completedRuns} of ${metrics.totalRuns} tests passed`
    case "failedRuns":
      return metrics.runningRuns > 0
        ? `${metrics.runningRuns} currently running`
        : "No tests running"
    case "totalRuns":
      return `${metrics.totalDefinitions} definitions • ${metrics.totalExecutors} executors`
    default:
      return ""
  }
}

export function generateMobileSubtitle(
  type: "passRate" | "failedRuns" | "totalRuns",
  metrics: MetricsData
): string {
  switch (type) {
    case "totalRuns":
      return `${metrics.totalDefinitions} defs • ${metrics.totalExecutors} execs`
    default:
      return generateSubtitle(type, metrics)
  }
}
