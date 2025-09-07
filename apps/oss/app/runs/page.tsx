"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus, Play, CheckCircle2, XCircle, Clock, MoreHorizontal, Filter, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "@tatou/core"
import type { Run } from "@tatou/core/types"
import { useRuns, useDefinitions, useExecutors, useDeleteRun } from "@/hooks/use-queries"
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal"

function getStatusIcon(status: string) {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="h-4 w-4 text-emerald-500" />
    case "failed":
      return <XCircle className="h-4 w-4 text-red-500" />
    case "running":
      return <Clock className="h-4 w-4 text-blue-500" />
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

function formatDuration(duration: number | null) {
  if (!duration) return "Running..."
  const seconds = Math.floor(duration / 1000)
  const minutes = Math.floor(seconds / 60)
  return `${minutes}m ${seconds % 60}s`
}

export default function RunsPage() {
  const { data: testRuns = [], isLoading: runsLoading } = useRuns()
  const { data: definitions = [] } = useDefinitions()
  const { data: executors = [] } = useExecutors()
  
  const deleteRunMutation = useDeleteRun()

  const [searchQuery, setSearchQuery] = useState("")
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [runToDelete, setRunToDelete] = useState<Run | null>(null)

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
    <div className="space-y-8 p-6">
      {/* Simple header */}
      <div>
        <h1 className="text-2xl font-semibold">Runs</h1>
      </div>

      {/* Test runs */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Test Runs</h2>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button size="sm" className="gap-2" asChild>
              <Link href="/runs/new">
                <Plus className="h-4 w-4" />
                New Run
              </Link>
            </Button>
          </div>
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
        description="Are you sure you want to delete this run? This will permanently remove the run data and cannot be undone."
        itemName={runToDelete?.name}
        itemType="Run"
      />
    </div>
  )
}