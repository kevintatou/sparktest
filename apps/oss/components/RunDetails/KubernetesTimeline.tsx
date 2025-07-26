import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Run } from "@tatou/core/types"

interface KubernetesTimelineProps {
  run: Run
  formatDate: (dateString: string) => string
  safeDate: (d: string | undefined) => Date
}

export function KubernetesTimeline({ run, formatDate, safeDate }: KubernetesTimelineProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Kubernetes Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Job Created</label>
              <p className="mt-1">{formatDate(safeDate(run.createdAt).toISOString())}</p>
            </div>

            {run.podScheduled && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Pod Scheduled</label>
                <p className="mt-1">{formatDate(safeDate(run.podScheduled).toISOString())}</p>
              </div>
            )}

            {run.containerCreated && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Container Created
                </label>
                <p className="mt-1">{formatDate(safeDate(run.containerCreated).toISOString())}</p>
              </div>
            )}

            {run.containerStarted && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Container Started
                </label>
                <p className="mt-1">{formatDate(safeDate(run.containerStarted).toISOString())}</p>
              </div>
            )}

            {(run.completed || run.failed) && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {run.completed ? "Completed" : "Failed"}
                </label>
                <p className="mt-1">
                  {formatDate(safeDate(run.completed || run.failed).toISOString())}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
