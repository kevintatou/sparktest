"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Download, Terminal, AlertCircle } from "lucide-react"
import { useKubernetesLogs } from "./useKubernetesLogs"
import { getStatusIcon, getStatusColor } from "./statusUtils"
import { LoadingState } from "./LoadingState"
import { KubernetesUnavailable } from "./KubernetesUnavailable"
import { EmptyState } from "./EmptyState"
import { LogsContent } from "./LogsContent"

interface KubernetesLogsProps {
  runId: string
  jobName?: string
  className?: string
}

export function KubernetesLogs({ runId, jobName, className }: KubernetesLogsProps) {
  const {
    logs,
    loading,
    error,
    kubernetesHealth,
    fetchLogs,
    downloadLogs,
    checkKubernetesHealth,
  } = useKubernetesLogs({ runId, jobName })

  if (!kubernetesHealth) {
    return <LoadingState className={className} />
  }

  if (!kubernetesHealth.kubernetes_connected) {
    return <KubernetesUnavailable onRetry={checkKubernetesHealth} className={className} />
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadLogs}
                  disabled={!logs.logs}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchLogs()}
              disabled={loading}
            >
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

        {!logs && !error && <EmptyState />}

        {logs && <LogsContent logs={logs} />}
      </CardContent>
    </Card>
  )
}

// Re-export for backward compatibility
export default KubernetesLogs