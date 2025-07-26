"use client"

import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Clock } from "lucide-react"
import type { JobLogs } from "@tatou/core/types"

interface LogsContentProps {
  logs: JobLogs
}

export function LogsContent({ logs }: LogsContentProps) {
  return (
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
  )
}
