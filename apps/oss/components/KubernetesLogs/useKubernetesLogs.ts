"use client"

import { useState, useEffect, useCallback } from "react"

export interface KubernetesLog {
  id: string
  timestamp: string
  level: "info" | "warning" | "error"
  message: string
  container?: string
}

export interface UseKubernetesLogsReturn {
  logs: KubernetesLog[]
  isLoading: boolean
  error: string | null
  isRefreshing: boolean
  refresh: () => void
  downloadLogs: () => void
  autoRefresh: boolean
  setAutoRefresh: (enabled: boolean) => void
}

export function useKubernetesLogs(runId: string): UseKubernetesLogsReturn {
  const [logs, setLogs] = useState<KubernetesLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(false)

  const fetchLogs = useCallback(async () => {
    if (!runId) return

    try {
      setError(null)
      const response = await fetch(`/api/runs/${runId}/logs`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch logs: ${response.statusText}`)
      }

      const data = await response.json()
      
      // Transform the logs data to match our interface
      const transformedLogs: KubernetesLog[] = (data.logs || []).map((log: any, index: number) => ({
        id: `${runId}-${index}`,
        timestamp: log.timestamp || new Date().toISOString(),
        level: log.level || "info",
        message: log.message || log,
        container: log.container
      }))

      setLogs(transformedLogs)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch logs"
      setError(message)
      console.error("Error fetching Kubernetes logs:", err)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [runId])

  const refresh = useCallback(() => {
    setIsRefreshing(true)
    fetchLogs()
  }, [fetchLogs])

  const downloadLogs = useCallback(() => {
    if (logs.length === 0) return

    const logContent = logs
      .map(log => `[${log.timestamp}] ${log.level.toUpperCase()}: ${log.message}`)
      .join('\n')

    const blob = new Blob([logContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `kubernetes-logs-${runId}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [logs, runId])

  // Initial fetch
  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      fetchLogs()
    }, 5000) // Refresh every 5 seconds

    return () => clearInterval(interval)
  }, [autoRefresh, fetchLogs])

  return {
    logs,
    isLoading,
    error,
    isRefreshing,
    refresh,
    downloadLogs,
    autoRefresh,
    setAutoRefresh
  }
}