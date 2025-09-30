"use client"

import { useState, useEffect, useCallback } from "react"
import type { JobLogs, KubernetesHealth } from "@tatou/core/types"

export interface UseKubernetesLogsParams {
  runId: string
}

export interface UseKubernetesLogsReturn {
  logs: JobLogs | null
  loading: boolean
  error: string | null
  kubernetesHealth: KubernetesHealth | null
  fetchLogs: () => void
  downloadLogs: () => void
  checkKubernetesHealth: () => void
}

export function useKubernetesLogs({ runId }: UseKubernetesLogsParams): UseKubernetesLogsReturn {
  const [logs, setLogs] = useState<JobLogs | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [kubernetesHealth, setKubernetesHealth] = useState<KubernetesHealth | null>(null)

  const fetchLogs = useCallback(async () => {
    if (!runId) return

    try {
      setError(null)
      setLoading(true)
      const response = await fetch(`/api/runs/${runId}/logs`)

      if (!response.ok) {
        // If it's a 404, stop polling and show appropriate error
        if (response.status === 404) {
          const errorData = await response.json().catch(() => ({ error: "Not Found" }))
          throw new Error(errorData.error || "Run logs not found")
        }
        throw new Error(`Failed to fetch logs: ${response.statusText}`)
      }

      const data = await response.json()
      setLogs(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch logs"
      setError(message)
      console.error("Error fetching Kubernetes logs:", err)
    } finally {
      setLoading(false)
    }
  }, [runId])

  const checkKubernetesHealth = useCallback(async () => {
    try {
      const response = await fetch("/api/k8s/health")
      if (response.ok) {
        const healthData = await response.json()
        setKubernetesHealth(healthData)
      } else {
        setKubernetesHealth({ kubernetes_connected: false, timestamp: new Date().toISOString() })
      }
    } catch (err) {
      console.error("Error checking Kubernetes health:", err)
      setKubernetesHealth({ kubernetes_connected: false, timestamp: new Date().toISOString() })
    }
  }, [])

  const downloadLogs = useCallback(() => {
    if (!logs || !logs.logs) return

    const logContent = logs.logs
    const blob = new Blob([logContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `kubernetes-logs-${runId}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [logs, runId])

  // Check Kubernetes health on mount
  useEffect(() => {
    checkKubernetesHealth()
  }, [checkKubernetesHealth])

  // Initial fetch of logs when kubernetesHealth is available and connected
  useEffect(() => {
    if (kubernetesHealth?.kubernetes_connected) {
      fetchLogs()
    }
  }, [kubernetesHealth, fetchLogs])

  // Auto-refresh logs every 10 seconds for running jobs
  useEffect(() => {
    if (!kubernetesHealth?.kubernetes_connected || !logs) return

    // Only auto-refresh if the job is still running
    if (logs.status === "running") {
      const interval = setInterval(() => {
        fetchLogs()
      }, 10000) // Refresh every 10 seconds

      return () => clearInterval(interval)
    }
  }, [kubernetesHealth, logs, fetchLogs])

  return {
    logs,
    loading,
    error,
    kubernetesHealth,
    fetchLogs,
    downloadLogs,
    checkKubernetesHealth,
  }
}
