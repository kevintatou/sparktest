"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Terminal, RefreshCw, AlertCircle } from "lucide-react"

interface KubernetesUnavailableProps {
  onRetry: () => void
  className?: string
}

export function KubernetesUnavailable({ onRetry, className }: KubernetesUnavailableProps) {
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
            <Button variant="outline" size="sm" onClick={onRetry}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Connection
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
