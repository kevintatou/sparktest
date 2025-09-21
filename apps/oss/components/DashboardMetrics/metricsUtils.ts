import { CheckCircle, XCircle, Clock, Play } from "lucide-react"

export interface MetricCardProps {
  title: string
  value: string | number
  subtitle: string | React.ReactNode
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
    cardBg: "bg-background border",
    border: "border-muted",
    title: "text-green-600 dark:text-green-400",
    value: "text-green-700 dark:text-green-300",
    subtitle: "text-muted-foreground",
    icon: "text-green-600 dark:text-green-400",
  },
  red: {
    cardBg: "bg-background border",
    border: "border-muted",
    title: "text-destructive",
    value: "text-destructive",
    subtitle: "text-muted-foreground",
    icon: "text-destructive",
  },
  blue: {
    cardBg: "bg-background border",
    border: "border-muted",
    title: "text-primary",
    value: "text-primary",
    subtitle: "text-muted-foreground",
    icon: "text-primary",
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
