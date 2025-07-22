import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Copy } from "lucide-react"
import { Run } from "@sparktest/core/types"
import { getStatusIcon, getStatusColor } from "./statusUtils"

interface RunOverviewProps {
  run: Run
  formatDate: (dateString: string) => string
  safeDate: (d: string | undefined) => Date
  copyToClipboard: (text: string, label: string) => void
}

export function RunOverview({ run, formatDate, safeDate, copyToClipboard }: RunOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon(run.status)}
            <div>
              <h3 className="text-xl font-semibold">{run.name}</h3>
              <p className="text-sm text-muted-foreground">Test Run Details</p>
            </div>
          </div>
          <Badge className={getStatusColor(run.status)} variant="outline">
            {run.status}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Run ID</label>
            <div className="flex items-center gap-2 mt-1">
              <p className="font-mono text-sm">{run.id}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(run.id, "Run ID")}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-muted-foreground">Kubernetes Job</label>
            <div className="flex items-center gap-2 mt-1">
              <p className="font-mono text-sm">{run.k8sJobName}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(run.k8sJobName || "", "Job Name")}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Duration</label>
            <p className="mt-1 font-medium">
              {run.status === "running" 
                ? "Running..." 
                : run.duration 
                  ? `${run.duration}s` 
                  : "N/A"
              }
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Started</label>
            <p className="mt-1">{formatDate(safeDate(run.createdAt).toISOString())}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Container Image</label>
            <p className="mt-1 font-mono text-sm">{run.image}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Command</label>
            <p className="mt-1 font-mono text-sm">
              {Array.isArray(run.command) ? run.command.join(' ') : run.command}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}