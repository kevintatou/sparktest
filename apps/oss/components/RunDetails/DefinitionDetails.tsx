import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, ExternalLink } from "lucide-react"
import { Definition } from "@sparktest/core/types"

interface DefinitionDetailsProps {
  definition: Definition
  copyToClipboard: (text: string, label: string) => void
}

export function DefinitionDetails({ definition, copyToClipboard }: DefinitionDetailsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Test Definition</span>
          <Button variant="outline" size="sm" asChild>
            <a href={`/definitions/${definition.id}`}>
              <ExternalLink className="h-4 w-4 mr-2" />
              View Definition
            </a>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Name</label>
            <p className="mt-1 font-semibold">{definition.name}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Definition ID</label>
            <div className="flex items-center gap-2 mt-1">
              <p className="font-mono text-sm">{definition.id}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(definition.id, "Definition ID")}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {definition.description && (
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-muted-foreground">Description</label>
              <p className="mt-1">{definition.description}</p>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-muted-foreground">Base Image</label>
            <p className="mt-1 font-mono text-sm">{definition.image}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Commands</label>
            <div className="mt-1 space-y-1">
              {definition.commands.map((cmd, index) => (
                <p
                  key={index}
                  className="font-mono text-sm bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded"
                >
                  {cmd}
                </p>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
