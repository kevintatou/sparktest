"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, XCircle, Clock, MoreHorizontal, Filter, TrendingUp, Activity } from "lucide-react"
import { useOptimizedNavigation } from "@/hooks/use-optimized-navigation"
import { useRuns } from "@/hooks/use-queries"
import type { Run } from "@tatou/core"

const StatusConfig = {
  completed: {
    icon: CheckCircle2,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/50 dark:text-green-400 dark:border-green-800/50",
    label: "completed"
  },
  failed: {
    icon: XCircle,
    color: "text-destructive", 
    bgColor: "bg-destructive/10 text-destructive border-destructive/20",
    label: "failed"
  },
  running: {
    icon: Clock,
    color: "text-primary",
    bgColor: "bg-primary/10 text-primary border-primary/20",
    label: "running"
  }
} as const

function StatusIcon({ status }: { status: string }) {
  const config = StatusConfig[status as keyof typeof StatusConfig]
  if (!config) return <Clock className="h-4 w-4 text-muted-foreground" />
  
  const Icon = config.icon
  return <Icon className={`h-4 w-4 ${config.color}`} />
}

function StatusBadge({ status }: { status: string }) {
  const config = StatusConfig[status as keyof typeof StatusConfig]
  if (!config) return <Badge variant="secondary">unknown</Badge>
  
  return (
    <Badge variant="secondary" className={config.bgColor}>
      {config.label}
    </Badge>
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
    <Card 
      className="hover:shadow-sm transition-all duration-200 cursor-pointer group border-l-4 border-l-muted hover:border-l-primary/50"
      onClick={() => navigate(runUrl)}
      onMouseEnter={() => preload(runUrl)}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <StatusIcon status={run.status} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium truncate text-sm">
                  {run.name || `Test Run ${run.id.slice(0, 8)}`}
                </h3>
                <StatusBadge status={run.status} />
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="font-mono bg-muted/50 px-2 py-0.5 rounded text-[10px]">
                  {run.id.slice(0, 8)}
                </span>
                <span>{formatDuration(run)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="hidden sm:block">{formatExecutedTime(run.createdAt)}</span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation()
                // Add dropdown menu functionality here
              }}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-6 w-32 bg-muted rounded animate-pulse" />
        <div className="h-8 w-16 bg-muted rounded animate-pulse" />
      </div>
      <div className="space-y-2">
        {Array(4).fill(null).map((_, i) => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="h-4 w-4 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-4 bg-muted rounded w-1/3" />
                    <div className="h-4 w-16 bg-muted rounded" />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-12 bg-muted rounded" />
                    <div className="h-3 w-16 bg-muted rounded" />
                  </div>
                </div>
              </div>
              <div className="h-3 w-24 bg-muted rounded" />
            </div>
          </Card>
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

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Activity className=" h-5 w-5 text-muted-foreground" />
          Recent Activity
        </h2>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      {runs.length === 0 ? (
        <Card className="p-8 text-center border-dashed">
          <div className="flex flex-col items-center gap-3">
            <Activity className="h-8 w-8 text-muted-foreground" />
            <div>
              <h3 className="font-medium text-muted-foreground">No runs yet</h3>
              <p className="text-sm text-muted-foreground">Create a test definition and run it to see results here.</p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-2">
          {runs.slice(0, 10).map((run) => (
            <RunItem key={run.id} run={run} />
          ))}
        </div>
      )}
    </section>
  )
}
