"use client"

import { useState, useEffect } from "react"
import { storage } from "@tatou/storage-service"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, Clock, RotateCcw, Filter, MoreHorizontal, Play } from "lucide-react"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Run } from "@tatou/core"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

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
  completed: {
    icon: CheckCircle,
    color: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-950/20",
    badge: "bg-emerald-100 text-emerald-700",
  },
  pending: {
    icon: Clock,
    color: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-950/20",
    badge: "bg-amber-100 text-amber-700",
  },
}


export function TestRunsList() {
  const [filter, setFilter] = useState("all")
  const [runs, setRuns] = useState<Run[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    let mounted = true
    storage.getRuns().then((data) => {
      if (mounted) setRuns(data)
    })
    // Optionally, set up polling or subscription here
    return () => { mounted = false }
  }, [])

  const filteredRuns = filter === "all" ? runs : runs.filter((run) => run.status === filter)

  const handleRunTest = async () => {
    setIsRunning(true)
    toast({ title: "Starting new test run...", description: "Your test is being started.", variant: "default" })
    try {
      // Replace with actual run logic as needed
      await storage.createRun("", { name: "Manual Run" })
      toast({ title: "Test run started!", description: "Redirecting to Test Runs page...", variant: "default" })
      router.push("/runs")
    } catch (err) {
      toast({ title: "Failed to start test run", description: String(err), variant: "destructive" })
    } finally {
      setIsRunning(false)
    }
  }

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
              <Button size="sm" className="gap-2" onClick={handleRunTest} disabled={isRunning}>
                <Play className="h-4 w-4" />
                <span className="hidden sm:inline">{isRunning ? "Running..." : "Run Test"}</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {filteredRuns.map((run) => {
              const config = statusConfig[run.status] || statusConfig["pending"]
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
                              {run.id}
                            </Badge>
                            <Badge className={cn("text-xs", config.badge)}>{run.status}</Badge>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm text-muted-foreground">
                          <span className="truncate">
                            Duration: <span className="font-medium">{run.duration ?? "-"}</span>
                          </span>
                          <span className="truncate">
                            Executed: <span className="font-medium">{run.createdAt ? new Date(run.createdAt).toLocaleString() : "-"}</span>
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
