"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCw, AlertTriangle, CheckCircle, XCircle, Clock } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { storage } from "@sparktest/storage-service"
import type { Run } from "@sparktest/core/types"

interface K8sJob {
  name: string
  status: string
  created_at: string
  namespace: string
  labels: Record<string, string>
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case "failed":
      return <XCircle className="h-4 w-4 text-red-500" />
    case "running":
      return <Clock className="h-4 w-4 text-blue-500 animate-pulse" />
    default:
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />
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

export default function K8sJobsDebugPage() {
  const { toast } = useToast()
  const [k8sJobs, setK8sJobs] = useState<K8sJob[]>([])
  const [databaseRuns, setDatabaseRuns] = useState<Run[]>([])
  const [loading, setLoading] = useState(false)
  const [k8sConnected, setK8sConnected] = useState<boolean | null>(null)

  const loadData = async () => {
    setLoading(true)
    try {
      // Load K8s health status
      const healthCheck = await storage.getKubernetesHealth()
      setK8sConnected(healthCheck.kubernetes_connected)

      // Load database runs
      const runs = await storage.getRuns()
      setDatabaseRuns(runs)

      // Load K8s jobs if connected
      if (healthCheck.kubernetes_connected) {
        const jobs = await storage.listKubernetesJobs()
        setK8sJobs(jobs)
      }
    } catch (error) {
      console.error("Error loading data:", error)
      toast({
        title: "Error",
        description: "Failed to load data: " + (error as Error).message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Find runs that have corresponding K8s jobs
  const matchedRuns = databaseRuns.filter(run => 
    run.k8sJobName && k8sJobs.some(job => job.name === run.k8sJobName)
  )

  // Find K8s jobs that don't have corresponding database runs
  const orphanedK8sJobs = k8sJobs.filter(job => 
    !databaseRuns.some(run => run.k8sJobName === job.name)
  )

  // Find database runs that don't have corresponding K8s jobs
  const orphanedRuns = databaseRuns.filter(run => 
    run.k8sJobName && !k8sJobs.some(job => job.name === run.k8sJobName)
  )

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            K8s Jobs Debug
          </h1>
          <p className="text-muted-foreground mt-1">
            Compare jobs in the GUI vs actual Kubernetes environment
          </p>
        </div>
        <Button
          onClick={loadData}
          disabled={loading}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        >
          {loading ? (
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Refresh
        </Button>
      </div>

      {/* Connection Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {k8sConnected ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            Kubernetes Connection Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Badge className={k8sConnected ? getStatusColor("completed") : getStatusColor("failed")}>
            {k8sConnected ? "Connected" : "Disconnected"}
          </Badge>
          {!k8sConnected && (
            <p className="text-sm text-muted-foreground mt-2">
              Make sure you have a Kubernetes cluster running and accessible via kubectl.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Database Runs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{databaseRuns.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">K8s Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{k8sJobs.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Matched</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{matchedRuns.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Mismatched</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {orphanedK8sJobs.length + orphanedRuns.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orphaned K8s Jobs */}
      {orphanedK8sJobs.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Kubernetes Jobs Not in Database ({orphanedK8sJobs.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {orphanedK8sJobs.map((job) => (
                <div key={job.name} className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(job.status)}
                    <div>
                      <p className="font-medium">{job.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Namespace: {job.namespace} | Created: {new Date(job.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(job.status)}>{job.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Orphaned Database Runs */}
      {orphanedRuns.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Database Runs Missing in K8s ({orphanedRuns.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {orphanedRuns.map((run) => (
                <div key={run.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(run.status)}
                    <div>
                      <p className="font-medium">{run.name}</p>
                      <p className="text-sm text-muted-foreground">
                        K8s Job: {run.k8sJobName} | Created: {new Date(run.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(run.status)}>{run.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Matched Jobs */}
      {matchedRuns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Properly Synchronized Jobs ({matchedRuns.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {matchedRuns.map((run) => {
                const k8sJob = k8sJobs.find(job => job.name === run.k8sJobName)
                return (
                  <div key={run.id} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(run.status)}
                      <div>
                        <p className="font-medium">{run.name}</p>
                        <p className="text-sm text-muted-foreground">
                          K8s Job: {run.k8sJobName}
                        </p>
                        <div className="flex gap-2 text-xs">
                          <span>DB Status: <Badge variant="outline">{run.status}</Badge></span>
                          {k8sJob && (
                            <span>K8s Status: <Badge variant="outline">{k8sJob.status}</Badge></span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {databaseRuns.length === 0 && k8sJobs.length === 0 && !loading && (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <AlertTriangle className="h-16 w-16 text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold mb-2">No Data Found</h3>
              <p className="text-muted-foreground">
                No database runs or Kubernetes jobs found. Try creating a test run first.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}