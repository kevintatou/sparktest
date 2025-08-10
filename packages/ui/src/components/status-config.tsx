import type React from "react"
import { CheckCircle, XCircle, Clock, RotateCcw, AlertCircle, Minus } from "lucide-react"

// Status configuration types
export interface StatusConfig {
  icon: React.ComponentType<{ className?: string }>
  color: string
  bg: string
  badge: string
  label: string
}

export type StatusType =
  | "passed"
  | "failed"
  | "running"
  | "completed"
  | "pending"
  | "error"
  | "cancelled"
  | "unknown"

// Default status configurations that can be imported and extended
export const defaultStatusConfig: Record<StatusType, StatusConfig> = {
  passed: {
    icon: CheckCircle,
    color: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-950/20",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
    label: "Passed",
  },
  failed: {
    icon: XCircle,
    color: "text-red-500",
    bg: "bg-red-50 dark:bg-red-950/20",
    badge: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    label: "Failed",
  },
  running: {
    icon: RotateCcw,
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-950/20",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    label: "Running",
  },
  completed: {
    icon: CheckCircle,
    color: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-950/20",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
    label: "Completed",
  },
  pending: {
    icon: Clock,
    color: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-950/20",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
    label: "Pending",
  },
  error: {
    icon: AlertCircle,
    color: "text-red-500",
    bg: "bg-red-50 dark:bg-red-950/20",
    badge: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    label: "Error",
  },
  cancelled: {
    icon: Minus,
    color: "text-gray-500",
    bg: "bg-gray-50 dark:bg-gray-950/20",
    badge: "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300",
    label: "Cancelled",
  },
  unknown: {
    icon: AlertCircle,
    color: "text-gray-500",
    bg: "bg-gray-50 dark:bg-gray-950/20",
    badge: "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300",
    label: "Unknown",
  },
}

// Helper function to get status configuration
export function getStatusConfig(
  status: string,
  customConfig?: Partial<Record<StatusType, StatusConfig>>
): StatusConfig {
  const config = { ...defaultStatusConfig, ...customConfig }
  const statusKey = status.toLowerCase() as StatusType
  return config[statusKey] || config.unknown
}

// Alternative status configurations for different use cases
export const minimalStatusConfig: Partial<Record<StatusType, StatusConfig>> = {
  passed: {
    icon: CheckCircle,
    color: "text-green-600",
    bg: "bg-green-100",
    badge: "bg-green-100 text-green-800",
    label: "✓",
  },
  failed: {
    icon: XCircle,
    color: "text-red-600",
    bg: "bg-red-100",
    badge: "bg-red-100 text-red-800",
    label: "✗",
  },
  running: {
    icon: RotateCcw,
    color: "text-blue-600",
    bg: "bg-blue-100",
    badge: "bg-blue-100 text-blue-800",
    label: "↻",
  },
}

// Compact status configuration with minimal colors
export const compactStatusConfig: Partial<Record<StatusType, StatusConfig>> = {
  passed: {
    icon: CheckCircle,
    color: "text-emerald-600",
    bg: "",
    badge: "bg-emerald-100 text-emerald-800",
    label: "OK",
  },
  failed: {
    icon: XCircle,
    color: "text-red-600",
    bg: "",
    badge: "bg-red-100 text-red-800",
    label: "FAIL",
  },
  running: {
    icon: RotateCcw,
    color: "text-blue-600",
    bg: "",
    badge: "bg-blue-100 text-blue-800",
    label: "RUN",
  },
}
