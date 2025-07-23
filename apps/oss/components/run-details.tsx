"use client"

import { Run, Definition, Executor } from "@sparktest/core/types"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { KubernetesLogs } from "@/components/kubernetes-logs"
import { CheckCircle, XCircle, Clock, AlertCircle, ExternalLink, Copy } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { storage } from "@sparktest/storage-service"
import type React from "react"

interface TestDetailsProps {
  test: Run
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return <CheckCircle className="h-5 w-5 text-green-500" />
    case "failed":
      return <XCircle className="h-5 w-5 text-red-500" />
    case "running":
      return <Clock className="h-5 w-5 text-blue-500" />
    default:
      return <AlertCircle className="h-5 w-5 text-yellow-500" />
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
    case "failed":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
    case "running":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
    default:
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
  }
}

export const RunDetails: React.FC<TestDetailsProps> = ({ test: run }) => {
  const { toast } = useToast()
  const [definition, setDefinition] = useState<Definition | null>(null)
  const [executor, setExecutor] = useState<Executor | null>(null)
  const [, setLoading] = useState(true)

  // Defensive: handle undefined run or createdAt
  const safeCreatedAt =
    run?.createdAt && !Number.isNaN(Date.parse(run.createdAt))
      ? run.createdAt
      : new Date().toISOString()

  const [activeRun] = useState<Run>({
    ...run,
    createdAt: safeCreatedAt,
    k8sJobName: run.k8sJobName || `test-run-${run.id}`, // Generate job name if not provided
  })

  // Load related definition and executor
  useEffect(() => {
    const loadRelatedData = async () => {
      try {
        if (activeRun.definitionId) {
          const def = await storage.getDefinitionById(activeRun.definitionId)
          setDefinition(def || null)

          if (def?.executorId) {
            const exec = await storage.getExecutorById(def.executorId)
            setExecutor(exec || null)
          }
        }
      } catch (error) {
        console.error("Error loading related data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadRelatedData()
  }, [activeRun.definitionId])

  // Utility: safely parse date or return "now"
  const safeDate = (d: string | undefined) =>
    new Date(d && !Number.isNaN(Date.parse(d)) ? d : Date.now())

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: `${label} copied to clipboard`,
    })
  }

  return (
    <div className="space-y-6">
      {/* Run Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon(activeRun.status)}
              <div>
                <h3 className="text-xl font-semibold">{activeRun.name}</h3>
                <p className="text-sm text-muted-foreground">Test Run Details</p>
              </div>
            </div>
            <Badge className={getStatusColor(activeRun.status)} variant="outline">
              {activeRun.status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Run ID</label>
              <div className="flex items-center gap-2 mt-1">
                <p className="font-mono text-sm">{activeRun.id}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(activeRun.id, "Run ID")}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Kubernetes Job</label>
              <div className="flex items-center gap-2 mt-1">
                <p className="font-mono text-sm">{activeRun.k8sJobName}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(activeRun.k8sJobName || "", "Job Name")}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Duration</label>
              <p className="mt-1 font-medium">
                {activeRun.status === "running"
                  ? "Running..."
                  : activeRun.duration
                    ? `${activeRun.duration}s`
                    : "N/A"}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Started</label>
              <p className="mt-1">{formatDate(safeDate(activeRun.createdAt).toISOString())}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Container Image</label>
              <p className="mt-1 font-mono text-sm">{activeRun.image}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Command</label>
              <p className="mt-1 font-mono text-sm">
                {Array.isArray(activeRun.command) ? activeRun.command.join(" ") : activeRun.command}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Definition Details */}
      {definition && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Test Definition</span>
              <Button variant="outline" size="sm" asChild>
                <a href={`/definitions/${definition.id}`}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Definition
                </a>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Name</label>
                <p className="mt-1 font-semibold">{definition.name}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Definition ID</label>
                <div className="flex items-center gap-2 mt-1">
                  <p className="font-mono text-sm">{definition.id}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(definition.id, "Definition ID")}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {definition.description && (
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="mt-1">{definition.description}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-muted-foreground">Base Image</label>
                <p className="mt-1 font-mono text-sm">{definition.image}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Commands</label>
                <div className="mt-1 space-y-1">
                  {definition.commands.map((cmd, index) => (
                    <p
                      key={index}
                      className="font-mono text-sm bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded"
                    >
                      {cmd}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Executor Details */}
      {executor && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Test Executor</span>
              <Button variant="outline" size="sm" asChild>
                <a href={`/executors/${executor.id}`}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Executor
                </a>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Name</label>
                <p className="mt-1 font-semibold">{executor.name}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Executor ID</label>
                <div className="flex items-center gap-2 mt-1">
                  <p className="font-mono text-sm">{executor.id}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(executor.id, "Executor ID")}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {executor.description && (
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="mt-1">{executor.description}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-muted-foreground">Default Image</label>
                <p className="mt-1 font-mono text-sm">{executor.image}</p>
              </div>

              {executor.supportedFileTypes && executor.supportedFileTypes.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Supported File Types
                  </label>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {executor.supportedFileTypes.map((type) => (
                      <Badge key={type} variant="outline" className="text-xs">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Kubernetes Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Kubernetes Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Job Created</label>
                <p className="mt-1">{formatDate(safeDate(activeRun.createdAt).toISOString())}</p>
              </div>

              {activeRun.podScheduled && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Pod Scheduled</label>
                  <p className="mt-1">
                    {formatDate(safeDate(activeRun.podScheduled).toISOString())}
                  </p>
                </div>
              )}

              {activeRun.containerCreated && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Container Created
                  </label>
                  <p className="mt-1">
                    {formatDate(safeDate(activeRun.containerCreated).toISOString())}
                  </p>
                </div>
              )}

              {activeRun.containerStarted && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Container Started
                  </label>
                  <p className="mt-1">
                    {formatDate(safeDate(activeRun.containerStarted).toISOString())}
                  </p>
                </div>
              )}

              {(activeRun.completed || activeRun.failed) && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {activeRun.completed ? "Completed" : "Failed"}
                  </label>
                  <p className="mt-1">
                    {formatDate(safeDate(activeRun.completed || activeRun.failed).toISOString())}
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Kubernetes Logs */}
      <KubernetesLogs runId={activeRun.id} jobName={activeRun.k8sJobName} />
    </div>
  )
}

export default RunDetails
