"use client"

import type { Definition } from "@sparktest/core/types"

interface DefaultSettingsDisplayProps {
  definition: Definition
}

export function DefaultSettingsDisplay({ definition }: DefaultSettingsDisplayProps) {
  return (
    <div className="space-y-4 border rounded-md p-4 bg-muted/30 animate-in fade-in-50">
      <h3 className="font-medium">Default Settings</h3>
      <div className="space-y-2 text-sm">
        <p>
          <span className="font-medium">Image:</span> {definition.image}
        </p>
        <div>
          <span className="font-medium">Commands:</span>
          <ul className="list-disc list-inside mt-1 space-y-1">
            {definition.commands.map((cmd, i) => (
              <li key={i}>{cmd}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}