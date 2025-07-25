"use client"

import { useState, useEffect, useCallback } from "react"
import { useToast } from "@/components/ui/use-toast"
import { storage } from "@sparktest/storage-service"
import type { JobLogs, KubernetesHealth } from "@sparktest/core/types"

interface UseKubernetesLogsProps {
  runId: string
  jobName?: string
}

export function useKubernetesLogs({ runId, jobName }: UseKubernetesLogsProps) {
  const { toast } = useToast()
  const [logs, setLogs] = useState<JobLogs | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [kubernetesHealth, setKubernetesHealth] = useState<KubernetesHealth | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(false)

  const checkKubernetesHealth = useCallback(async () => {
    try {
      const health = await storage.getKubernetesHealth()
      setKubernetesHealth(health)
    } catch (error) {
      console.warn("Kubernetes health check failed:", error)
      setKubernetesHealth({ kubernetes_connected: false, timestamp: new Date().toISOString() })
    }
  }, [])

  const fetchLogs = useCallback(async (showToast = true) => {
    if (!kubernetesHealth?.kubernetes_connected) {
      setError("Kubernetes is not available")
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Try to get logs by run ID first, fallback to job name
      const logData = await storage.getTestRunLogs(runId)
      setLogs(logData)
      
      // Enable auto-refresh for running jobs
      if (logData.status === "running") {
        setAutoRefresh(true)
      } else {
        setAutoRefresh(false)
      }

      if (showToast) {
        toast({
          title: "Logs retrieved",
          description: `Successfully fetched logs for ${logData.job_name}`,
        })
      }
    } catch (error: any) {
      const errorMessage = error.message || "Failed to fetch logs"
      setError(errorMessage)
      
      if (showToast) {
        toast({
          title: "Error fetching logs",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
    }
  }, [runId, kubernetesHealth?.kubernetes_connected, toast])

  const downloadLogs = useCallback(() => {
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
  }, [logs, toast])

  // Check Kubernetes health on mount
  useEffect(() => {
    checkKubernetesHealth()
  }, [checkKubernetesHealth])

  // Auto-refresh logs for running jobs
  useEffect(() => {
    if (!autoRefresh || !logs || logs.status !== "running") return

    const interval = setInterval(() => {
      fetchLogs(false) // Silent refresh
    }, 5000)

    return () => clearInterval(interval)
  }, [autoRefresh, logs?.status, fetchLogs])

  return {
    logs,
    loading,
    error,
    kubernetesHealth,
    autoRefresh,
    fetchLogs,
    downloadLogs,
    checkKubernetesHealth,
  }
}