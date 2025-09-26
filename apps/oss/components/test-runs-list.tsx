"use client"

import { CheckCircle2, XCircle, Clock, MoreHorizontal, Filter, Activity } from "lucide-react"
import { useOptimizedNavigation } from "@/hooks/use-optimized-navigation"
import { useRuns } from "@/hooks/use-queries"
import type { Run } from "@tatou/core"

const StatusConfig = {
  completed: {
    icon: CheckCircle2,
    color: "text-emerald-600 dark:text-emerald-500",
    bgColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    label: "completed",
  },
  failed: {
    icon: XCircle,
    color: "text-rose-600 dark:text-rose-500",
    bgColor: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
    label: "failed",
  },
  running: {
    icon: Clock,
    color: "text-amber-600 dark:text-amber-500",
    bgColor: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    label: "running",
  },
} as const

function StatusIcon({ status }: { status: string }) {
  const config = StatusConfig[status as keyof typeof StatusConfig]
  if (!config) return <Clock className="h-4 w-4 text-slate-400 dark:text-slate-500" />

  const Icon = config.icon
  return <Icon className={`h-4 w-4 ${config.color}`} />
}

function StatusBadge({ status }: { status: string }) {
  const config = StatusConfig[status as keyof typeof StatusConfig]
  if (!config)
    return (
      <span className="px-2 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-full">
        unknown
      </span>
    )

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.bgColor}`}>
      {config.label}
    </span>
  )
}

function formatDuration(run: Run) {
  if (run.status === "running") return "Running..."
  if (!run.duration) return "N/A"

  const ms = parseInt(run.duration.toString())
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  return `${minutes}m ${seconds % 60}s`
}

function formatExecutedTime(dateStr: string) {
  if (!dateStr) return "N/A"
  try {
    return new Date(dateStr).toLocaleString()
  } catch {
    return "N/A"
  }
}

function RunItem({ run }: { run: Run }) {
  const { navigate, preload } = useOptimizedNavigation()
  const runUrl = `/runs/${run.id}`

  return (
    <div
      className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm p-4 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 cursor-pointer group"
      onClick={() => navigate(runUrl)}
      onMouseEnter={() => preload(runUrl)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <StatusIcon status={run.status} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h3 className="font-medium text-slate-900 dark:text-slate-100 truncate text-sm">
                {run.name || `Test Run ${run.id.slice(0, 8)}`}
              </h3>
              <StatusBadge status={run.status} />
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
              <span className="font-mono bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-xs">
                {run.id.slice(0, 8)}
              </span>
              <span>{formatDuration(run)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
          <span className="hidden sm:block">{formatExecutedTime(run.createdAt)}</span>
          <button
            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center"
            onClick={(e) => {
              e.stopPropagation()
              // Add dropdown menu functionality here
            }}
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
      </div>
      <div className="space-y-3">
        {Array(4)
          .fill(null)
          .map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm p-4 animate-pulse"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="h-4 w-4 bg-slate-200 dark:bg-slate-700 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
                      <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-12 bg-slate-100 dark:bg-slate-600 rounded" />
                      <div className="h-3 w-16 bg-slate-100 dark:bg-slate-600 rounded" />
                    </div>
                  </div>
                </div>
                <div className="h-3 w-24 bg-slate-100 dark:bg-slate-600 rounded" />
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}

export function TestRunsList() {
  const { data: runs = [], isLoading } = useRuns()

  if (isLoading) {
    return <LoadingSkeleton />
  }

  // Sort runs by newest first for recent activity
  const sortedRuns = runs.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Activity className="h-5 w-5 text-slate-500 dark:text-slate-400" />
          Recent Activity
        </h2>
        <button className="px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </button>
      </div>

      {runs.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <Activity className="h-12 w-12 text-slate-400 dark:text-slate-500" />
            <div>
              <h3 className="font-medium text-slate-600 dark:text-slate-300 mb-1">No runs yet</h3>
              <p className="text-sm text-slate-400 dark:text-slate-500">
                Create a test definition and run it to see results here.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedRuns.slice(0, 10).map((run) => (
            <RunItem key={run.id} run={run} />
          ))}
        </div>
      )}
    </section>
  )
}
