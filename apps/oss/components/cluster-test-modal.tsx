"use client"

import { useState } from "react"
import { CheckCircle, XCircle, Loader2, Server, AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface ClusterTestResult {
  component: string
  status: "success" | "warning" | "error"
  message: string
  details?: string
}

interface ClusterTestModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ClusterTestModal({ isOpen, onClose }: ClusterTestModalProps) {
  const [testing, setTesting] = useState(false)
  const [results, setResults] = useState<ClusterTestResult[]>([])
  const [progress, setProgress] = useState(0)
  const [currentTest, setCurrentTest] = useState("")

  const runClusterTests = async () => {
    setTesting(true)
    setResults([])
    setProgress(0)

    const tests = [
      { name: "API Server Connection", component: "api-server" },
      { name: "Node Health Check", component: "nodes" },
      { name: "DNS Resolution", component: "dns" },
      { name: "Network Policies", component: "network" },
      { name: "RBAC Permissions", component: "rbac" },
      { name: "Storage Classes", component: "storage" },
      { name: "Ingress Controller", component: "ingress" },
    ]

    for (let i = 0; i < tests.length; i++) {
      const test = tests[i]
      setCurrentTest(test.name)
      setProgress(((i + 1) / tests.length) * 100)

      await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 1200))

      // Simulate test results (mostly successful)
      const rand = Math.random()
      let status: "success" | "warning" | "error"
      let message: string
      let details: string | undefined

      if (rand > 0.85) {
        status = "error"
        message = "Connection failed"
        details = "Unable to connect to component"
      } else if (rand > 0.7) {
        status = "warning"
        message = "Degraded performance"
        details = "Component responding slowly"
      } else {
        status = "success"
        message = "Healthy"
        details = "All checks passed"
      }

      setResults((prev) => [
        ...prev,
        {
          component: test.component,
          status,
          message,
          details,
        },
      ])
    }

    setTesting(false)
    setCurrentTest("Tests completed")
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-500">Healthy</Badge>
      case "warning":
        return (
          <Badge variant="outline" className="border-yellow-500 text-yellow-600">
            Warning
          </Badge>
        )
      case "error":
        return <Badge variant="destructive">Error</Badge>
      default:
        return null
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Cluster Health Check
          </DialogTitle>
          <DialogDescription>
            Test connectivity and health of all cluster components
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {testing && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">{currentTest}</span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground">{Math.round(progress)}% complete</p>
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium">Test Results:</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {results.map((result, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result.status)}
                      <div>
                        <p className="font-medium capitalize">
                          {result.component.replace("-", " ")}
                        </p>
                        <p className="text-sm text-muted-foreground">{result.details}</p>
                      </div>
                    </div>
                    {getStatusBadge(result.status)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {!testing && results.length === 0 && (
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">
                This will test connectivity to all cluster components including API server, nodes,
                DNS, and networking.
              </p>
            </div>
          )}

          {!testing && results.length > 0 && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                ✓ Cluster health check completed.{" "}
                {results.filter((r) => r.status === "success").length} of {results.length}{" "}
                components are healthy.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={runClusterTests} disabled={testing} className="min-w-[120px]">
            {testing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Server className="mr-2 h-4 w-4" />
                Run Health Check
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
