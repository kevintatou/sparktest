"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, Clock, RotateCcw, Filter, MoreHorizontal, Play } from "lucide-react"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const statusConfig = {
  passed: {
    icon: CheckCircle,
    color: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-950/20",
    badge: "bg-emerald-100 text-emerald-700",
  },
  failed: {
    icon: XCircle,
    color: "text-red-500",
    bg: "bg-red-50 dark:bg-red-950/20",
    badge: "bg-red-100 text-red-700",
  },
  running: {
    icon: RotateCcw,
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-950/20",
    badge: "bg-blue-100 text-blue-700",
  },
  pending: {
    icon: Clock,
    color: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-950/20",
    badge: "bg-amber-100 text-amber-700",
  },
}

const mockRuns = [
  {
    id: "1",
    name: "API Integration Suite",
    description: "Full API endpoint validation",
    status: "passed" as const,
    executedAt: "2 minutes ago",
    duration: "1m 23s",
    runId: "#1247",
    environment: "production",
  },
  {
    id: "2",
    name: "Frontend E2E Tests",
    description: "User journey validation",
    status: "running" as const,
    executedAt: "30 seconds ago",
    duration: "2m 15s",
    runId: "#1248",
    environment: "staging",
  },
  {
    id: "3",
    name: "Database Migration Test",
    description: "Schema validation and data integrity",
    status: "failed" as const,
    executedAt: "5 minutes ago",
    duration: "45s",
    runId: "#1246",
    environment: "development",
  },
  {
    id: "4",
    name: "Security Scan",
    description: "Vulnerability assessment",
    status: "passed" as const,
    executedAt: "10 minutes ago",
    duration: "3m 42s",
    runId: "#1245",
    environment: "production",
  },
]

export function TestRunsList() {
  const [filter, setFilter] = useState("all")

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-lg sm:text-xl">Recent Test Runs</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Latest execution results across all environments</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Filter className="h-4 w-4" />
                    <span className="hidden sm:inline">Filter</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setFilter("all")}>All Tests</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter("passed")}>Passed Only</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter("failed")}>Failed Only</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter("running")}>Running Only</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button size="sm" className="gap-2">
                <Play className="h-4 w-4" />
                <span className="hidden sm:inline">Run Test</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {mockRuns.map((run) => {
              const config = statusConfig[run.status]
              const StatusIcon = config.icon

              return (
                <div key={run.id} className="p-4 sm:p-6 hover:bg-muted/30 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                      <div className={cn("p-2 rounded-lg flex-shrink-0", config.bg)}>
                        <StatusIcon className={cn("h-4 w-4 sm:h-5 sm:w-5", config.color)} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                          <h3 className="font-semibold text-base sm:text-lg truncate">{run.name}</h3>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Badge variant="outline" className="text-xs">
                              {run.runId}
                            </Badge>
                            <Badge className={cn("text-xs", config.badge)}>{run.status}</Badge>
                          </div>
                        </div>

                        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{run.description}</p>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm text-muted-foreground">
                          <span className="truncate">
                            Environment: <span className="font-medium">{run.environment}</span>
                          </span>
                          <span className="truncate">
                            Duration: <span className="font-medium">{run.duration}</span>
                          </span>
                          <span className="truncate">
                            Executed: <span className="font-medium">{run.executedAt}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex-shrink-0 self-start">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Rerun Test</DropdownMenuItem>
                          <DropdownMenuItem>Download Logs</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
