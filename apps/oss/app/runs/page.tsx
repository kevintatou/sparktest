"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus, Play, CheckCircle2, XCircle, Clock, MoreHorizontal, Filter, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "@tatou/core"
import type { Run } from "@tatou/core/types"
import { storage } from "@tatou/storage-service"
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal"
import { useRuns, useDefinitions, useExecutors, useDeleteRun } from "@/hooks/use-queries"

// Component to show live duration for running tests
const LiveDuration = ({ run }: { run: Run }) => {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (run.status !== "running") return

    const startTime = new Date(run.createdAt).getTime()

    const interval = setInterval(() => {
      const now = new Date().getTime()
      const elapsedSeconds = Math.floor((now - startTime) / 1000)
      setElapsed(elapsedSeconds)
    }, 1000)

    return () => clearInterval(interval)
  }, [run.status, run.createdAt])

  if (run.status === "running") {
    return <span className="font-medium text-blue-600 animate-pulse">{elapsed}s (running)</span>
  }

  return <span className="font-medium">{run.duration || 0}s</span>
}

function getStatusIcon(status: string) {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="h-4 w-4 text-emerald-500" />
    case "failed":
      return <XCircle className="h-4 w-4 text-red-500" />
    case "running":
      return <Clock className="h-4 w-4 text-blue-500 animate-pulse" />
    default:
      return <AlertTriangle className="h-4 w-4 text-amber-500" />
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

export default function TestRunsPage() {
  const { data: testRuns = [], isLoading: runsLoading, error: runsError } = useRuns()
  const { data: definitions = [], isLoading: definitionsLoading } = useDefinitions()
  const { data: executors = [], isLoading: executorsLoading } = useExecutors()

  const deleteRunMutation = useDeleteRun()

  const [searchQuery, setSearchQuery] = useState("")
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [runToDelete, setRunToDelete] = useState<Run | null>(null)
  const initializedRef = useRef(false)

  const isLoading = runsLoading || definitionsLoading || executorsLoading

  // Subscribe to real-time run updates
  useEffect(() => {
    if (!initializedRef.current && testRuns.length > 0) {
      const unsubscribe = storage.subscribeToRuns(
        ({ eventType: _eventType, new: _newRun, old: _oldRun }) => {
          // Real-time updates are handled by React Query's refetch functionality
          // We could invalidate queries here if needed
        }
      )

      initializedRef.current = true
      return unsubscribe
    }
  }, [testRuns.length])

  // Helper function to get definition name from ID
  const getDefinitionName = (definitionId?: string) => {
    if (!definitionId) return "Unknown"
    const definition = definitions.find((d) => d.id === definitionId)
    return definition?.name || `Definition ${definitionId}`
  }

  // Helper function to get executor name from ID
  const getExecutorName = (executorId?: string) => {
    if (!executorId) return "Unknown"
    const executor = executors.find((e) => e.id === executorId)
    return executor?.name || `Executor ${executorId}`
  }

  const handleDelete = (run: Run) => {
    deleteRunMutation.mutate(run.id, {
      onSuccess: () => {
        setDeleteModalOpen(false)
        setRunToDelete(null)
      },
    })
  }

  const handleDeleteClick = (run: Run) => {
    setRunToDelete(run)
    setDeleteModalOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (runToDelete) {
      handleDelete(runToDelete)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false)
    setRunToDelete(null)
  }

  // Filter runs based on search query
  const filteredRuns = testRuns.filter(
    (run) =>
      run.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      run.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
      run.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getDefinitionName(run.definitionId).toLowerCase().includes(searchQuery.toLowerCase()) ||
      getExecutorName(run.executorId).toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Runs
          </h1>
          <p className="text-muted-foreground mt-1">Monitor and manage your runs</p>
        </div>
        <Button
          asChild
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        >
          <Link href="/runs/new">
            <Plus className="mr-2 h-4 w-4" />
            New Run
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative w-full max-w-sm">
          <Input
            placeholder="Search runs..."
            className="pl-10 bg-slate-50 dark:bg-slate-800 border-0 focus-visible:ring-1"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array(6)
            .fill(null)
            .map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-4">
                  <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-48"></div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Array(4)
                      .fill(null)
                      .map((_, j) => (
                        <div key={j} className="space-y-2">
                          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
                          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      ) : runsError ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <XCircle className="h-16 w-16 text-red-500" />
            <div>
              <h3 className="text-lg font-semibold mb-2">Failed to load runs</h3>
              <p className="text-muted-foreground mb-4">
                There was an error loading the test runs. Please try refreshing the page.
              </p>
            </div>
          </div>
        </Card>
      ) : filteredRuns.length === 0 ? (
        <Card className="p-12 text-center bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 border-dashed">
          <div className="flex flex-col items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center">
              <Play className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery ? "No runs match your search" : "No runs yet"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery
                  ? "Try adjusting your search terms."
                  : "Start your first run to see execution results here."}
              </p>
              {!searchQuery && (
                <Button
                  asChild
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  <Link href="/runs/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Start Run
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRuns.map((run) => (
            <Card
              key={run.id}
              className="group hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border-slate-200 dark:border-slate-700"
            >
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(run.status)}
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                        {run.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">Run ID: {run.id}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(run.status)}>{run.status}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Started:</span>
                    <p className="font-medium">{formatDistanceToNow(run.createdAt)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Duration:</span>
                    <p>
                      <LiveDuration run={run} />
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Test Definition:</span>
                    <p className="font-medium text-blue-600 dark:text-blue-400">
                      {getDefinitionName(run.definitionId)}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Executor:</span>
                    <p className="font-medium text-purple-600 dark:text-purple-400">
                      {getExecutorName(run.executorId)}
                    </p>
                  </div>
                </div>

                {/* Kubernetes Job Info */}
                {run.k8sJobName && (
                  <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Cpu className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">Kubernetes Job</span>
                    </div>
                    <p className="text-sm font-mono text-slate-600 dark:text-slate-400">
                      {run.k8sJobName}
                    </p>
                  </div>
                )}

                {/* Log Preview */}
                {run.logs && run.logs.length > 0 && (
                  <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">Recent Logs</span>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/runs/${run.id}`} className="text-xs">
                          View All
                        </Link>
                      </Button>
                    </div>
                    <div className="text-sm font-mono text-slate-700 dark:text-slate-300 max-h-20 overflow-hidden">
                      {Array.isArray(run.logs)
                        ? run.logs.slice(-3).join("\n")
                        : String(run.logs || "")}
                      {Array.isArray(run.logs) && run.logs.length > 3 && (
                        <div className="text-xs text-muted-foreground mt-1">
                          ... and {run.logs.length - 3} more lines
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-4 bg-slate-50/50 dark:bg-slate-800/50">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/runs/${run.id}`}>View Details</Link>
                  </Button>
                  {(run.logs || run.k8sJobName) && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Link href={`/runs/${run.id}#logs`}>
                        <FileText className="mr-1 h-3 w-3" />
                        Logs
                      </Link>
                    </Button>
                  )}
                  {run.status !== "running" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200 dark:text-red-400 dark:hover:bg-red-950 dark:hover:text-red-300"
                      onClick={() => handleDeleteClick(run)}
                      disabled={deleteRunMutation.isPending}
                    >
                      {deleteRunMutation.isPending && deleteRunMutation.variables === run.id ? (
                        <svg
                          className="h-4 w-4 animate-spin"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      ) : (
                        "Delete"
                      )}
                    </Button>
                  )}
                </div>
                {run.status === "failed" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:hover:bg-blue-900 dark:text-blue-300 dark:border-blue-800"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Retry
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>

        {runsLoading ? (
          <div className="space-y-3">
            {Array(6)
              .fill(null)
              .map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="h-6 w-6 bg-muted rounded-full" />
                        <div className="space-y-1 flex-1">
                          <div className="h-4 w-48 bg-muted rounded" />
                          <div className="h-3 w-64 bg-muted rounded" />
                        </div>
                      </div>
                      <div className="h-8 w-8 bg-muted rounded" />
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        ) : filteredRuns.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                <Play className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  {searchQuery ? "No runs match your search" : "No runs yet"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery
                    ? "Try adjusting your search terms."
                    : "Create your first run to get started."}
                </p>
                {!searchQuery && (
                  <Button asChild>
                    <Link href="/runs/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Run
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredRuns.map((run) => (
              <Card key={run.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      {getStatusIcon(run.status)}
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-medium">{run.name}</h3>
                          <Badge variant="outline" className="text-xs font-mono">
                            {run.id}
                          </Badge>
                          {getStatusBadge(run.status)}
                        </div>
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <span>Duration: {formatDuration(run.duration)}</span>
                          <span>Definition: {getDefinitionName(run.definitionId)}</span>
                          <span>Executor: {getExecutorName(run.executorId)}</span>
                          <span>Created: {formatDistanceToNow(run.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(run)}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        isDeleting={deleteRunMutation.isPending}
        title="Delete Run"
        description="Are you sure you want to delete this run? This will permanently remove the run history, logs, and results."
        itemName={runToDelete?.name}
        itemType="Run"
      />
    </div>
  )
}