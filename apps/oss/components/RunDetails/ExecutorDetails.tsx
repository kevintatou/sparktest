import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Copy, ExternalLink } from "lucide-react"
import { Executor } from "@sparktest/core/types"

interface ExecutorDetailsProps {
  executor: Executor
  copyToClipboard: (text: string, label: string) => void
}

export function ExecutorDetails({ executor, copyToClipboard }: ExecutorDetailsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Test Executor</span>
          <Button variant="outline" size="sm" asChild>
            <a href={`/executors/${executor.id}`}>
              <ExternalLink className="h-4 w-4 mr-2" />
              View Executor
            </a>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Name</label>
            <p className="mt-1 font-semibold">{executor.name}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Executor ID</label>
            <div className="flex items-center gap-2 mt-1">
              <p className="font-mono text-sm">{executor.id}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(executor.id, "Executor ID")}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {executor.description && (
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-muted-foreground">Description</label>
              <p className="mt-1">{executor.description}</p>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-muted-foreground">Default Image</label>
            <p className="mt-1 font-mono text-sm">{executor.image}</p>
          </div>

          {executor.supportedFileTypes && executor.supportedFileTypes.length > 0 && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Supported File Types
              </label>
              <div className="mt-1 flex flex-wrap gap-1">
                {executor.supportedFileTypes.map((type) => (
                  <Badge key={type} variant="outline" className="text-xs">
                    {type}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
