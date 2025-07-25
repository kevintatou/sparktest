"use client"

import { Terminal } from "lucide-react"

interface EmptyStateProps {
  className?: string
}

export function EmptyState({ className: _className }: EmptyStateProps) {
  return (
    <div className="text-center py-8">
      <Terminal className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="font-semibold mb-2">No logs loaded</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Click &quot;Refresh&quot; to fetch logs from Kubernetes.
      </p>
    </div>
  )
}
