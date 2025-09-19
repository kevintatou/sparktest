"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, XCircle, Clock, MoreHorizontal, Filter } from "lucide-react"
import { useRouter } from "next/navigation"
import { useRuns } from "@/hooks/use-queries"
import type { Run } from "@tatou/core"

function getStatusIcon(status: string) {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="h-4 w-4 text-emerald-500" />
    case "failed":
      return <XCircle className="h-4 w-4 text-red-500" />
    case "running":
      return <Clock className="h-4 w-4 text-blue-500" />
    default:
      return <Clock className="h-4 w-4 text-amber-500" />
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "completed":
      return (
        <Badge
          variant="secondary"
          className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800/50"
        >
          completed
        </Badge>
      )
    case "failed":
      return (
        <Badge
          variant="secondary"
          className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800/50"
        >
          failed
        </Badge>
      )
    case "running":
      return (
        <Badge
          variant="secondary"
          className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800/50"
        >
          running
        </Badge>
      )
    default:
      return <Badge variant="secondary">unknown</Badge>
  }
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

export function TestRunsList() {
  const { data: runs = [], isLoading } = useRuns()
  const router = useRouter()

  if (isLoading) {
    return (
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Recent Runs</h2>
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>
        <div className="space-y-3">
          {Array(4).fill(null).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="h-4 w-4 bg-muted rounded-full" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-muted rounded w-1/2" />
                      <div className="h-3 bg-muted rounded w-1/3" />
                    </div>
                  </div>
                  <div className="h-8 w-8 bg-muted rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Recent Runs</h2>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      <div className="space-y-3">
        {runs.slice(0, 10).map((run) => (
          <Card key={run.id} className="hover:shadow-sm transition-shadow cursor-pointer" onClick={() => router.push(`/runs/${run.id}`)}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  {getStatusIcon(run.status)}
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium">{run.name || `Test Run ${run.id.slice(0, 8)}`}</h3>
                      <Badge variant="outline" className="text-xs font-mono">
                        {run.id.slice(0, 12)}
                      </Badge>
                      {getStatusBadge(run.status)}
                    </div>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <span>Duration: {formatDuration(run)}</span>
                      <span>Executed: {formatExecutedTime(run.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={(e) => {
                  e.stopPropagation()
                  // Add dropdown menu functionality here
                }}>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
