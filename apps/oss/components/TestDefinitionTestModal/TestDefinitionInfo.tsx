"use client"

import { Badge } from "@/components/ui/badge"
import type { Definition } from "@tatou/core/types"

interface DefinitionInfoProps {
  testDefinition: Definition
}

export function DefinitionInfo({ testDefinition }: DefinitionInfoProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="font-medium">Image:</span>
          <p className="text-muted-foreground font-mono">{testDefinition.image}</p>
        </div>
        <div>
          <span className="font-medium">Executor:</span>
          <Badge variant="outline">{testDefinition.executorId || "custom"}</Badge>
        </div>
      </div>

      <div>
        <span className="text-sm font-medium">Commands:</span>
        <div className="mt-1 space-y-1">
          {testDefinition.commands.map((cmd: string, i: number) => (
            <div key={i} className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-xs">
                {i + 1}
              </Badge>
              <code className="text-sm bg-muted px-2 py-1 rounded">{cmd}</code>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
