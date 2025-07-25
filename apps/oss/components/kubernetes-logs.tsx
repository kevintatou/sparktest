"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  RefreshCw,
  Download,
  Terminal,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { storage } from "@tatou/storage-service"
import type { JobLogs, KubernetesHealth } from "@tatou/core/types"

interface KubernetesLogsProps {
  runId: string
  jobName?: string
  className?: string
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case "failed":
      return <XCircle className="h-4 w-4 text-red-500" />
    case "running":
      return <Clock className="h-4 w-4 text-blue-500" />
    default:
      return <AlertCircle className="h-4 w-4 text-yellow-500" />
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

export function KubernetesLogs({ runId, jobName: _jobName, className }: KubernetesLogsProps) {
  const { toast } = useToast()
  const [logs, setLogs] = useState<JobLogs | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [kubernetesHealth, setKubernetesHealth] = useState<KubernetesHealth | null>(null)
  const [autoRefresh] = useState(false)

  // Check Kubernetes health on mount
  useEffect(() => {
    const initializeHealth = async () => {
      try {
        await checkKubernetesHealth()
      } catch (error) {
        console.error("Failed to initialize Kubernetes health check:", error)
      }
    }

    initializeHealth()
  }, [])

  const checkKubernetesHealth = async () => {
    try {
      const health = await storage.getKubernetesHealth()
      setKubernetesHealth(health)
    } catch (error) {
      console.warn("Kubernetes health check failed:", error)
      setKubernetesHealth({ kubernetes_connected: false, timestamp: new Date().toISOString() })
    }
  }

  const fetchLogs = useCallback(
    async (showToast = true) => {
      if (!kubernetesHealth?.kubernetes_connected) {
        setError("Kubernetes is not available")
        return
      }

      try {
        setLoading(true)
        setError(null)
        const jobLogs = await storage.getJobLogs(_jobName || runId)
        setLogs(jobLogs)

        if (showToast) {
          toast({
            title: "Logs refreshed",
            description: "Job logs have been updated",
          })
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to fetch logs"
        setError(errorMessage)
        if (showToast) {
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
          })
        }
      } finally {
        setLoading(false)
      }
    },
    [_jobName, kubernetesHealth, toast, runId]
  )

  // Auto-refresh logs for running jobs
  useEffect(() => {
    if (!autoRefresh || !logs || logs.status !== "running") return

    const interval = setInterval(() => {
      fetchLogs(false) // Silent refresh
    }, 5000)

    return () => clearInterval(interval)
  }, [autoRefresh, logs, fetchLogs])

  const downloadLogs = () => {
    if (!logs) return

    const blob = new Blob([logs.logs], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${logs.job_name}-logs.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Logs downloaded",
      description: `Downloaded logs for ${logs.job_name}`,
    })
  }

  if (!kubernetesHealth) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            Kubernetes Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2 text-sm text-muted-foreground">
              Checking Kubernetes status...
            </span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!kubernetesHealth.kubernetes_connected) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            Kubernetes Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Kubernetes Unavailable</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Kubernetes cluster is not accessible. Logs cannot be retrieved.
              </p>
              <Button variant="outline" size="sm" onClick={checkKubernetesHealth}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Connection
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            Kubernetes Logs
          </div>
          <div className="flex items-center gap-2">
            {logs && (
              <>
                <Badge className={getStatusColor(logs.status)} variant="outline">
                  <div className="flex items-center gap-1">
                    {getStatusIcon(logs.status)}
                    {logs.status}
                  </div>
                </Badge>
                <Button variant="outline" size="sm" onClick={downloadLogs} disabled={!logs.logs}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </>
            )}
            <Button variant="outline" size="sm" onClick={() => fetchLogs()} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Loading..." : "Refresh"}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Error: {error}</span>
            </div>
          </div>
        )}

        {!logs && !error && (
          <div className="text-center py-8">
            <Terminal className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No logs loaded</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Click &quot;Refresh&quot; to fetch logs from Kubernetes.
            </p>
          </div>
        )}

        {logs && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Job Name:</span>
                <p className="font-mono text-xs">{logs.job_name}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Pod Name:</span>
                <p className="font-mono text-xs">{logs.pod_name}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>
                <p className="font-medium">{logs.status}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Retrieved:</span>
                <p className="font-medium">{new Date(logs.timestamp).toLocaleTimeString()}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Container Logs</label>
                {logs.status === "running" && (
                  <Badge variant="outline" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    Auto-refreshing
                  </Badge>
                )}
              </div>
              <Textarea
                readOnly
                value={logs.logs || "No logs available"}
                className="min-h-[300px] font-mono text-xs bg-slate-50 dark:bg-slate-900"
                placeholder="Logs will appear here..."
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
