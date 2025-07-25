"use client"

import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface CommandsSectionProps {
  commands: string[]
  addCommand: () => void
  removeCommand: (index: number) => void
  updateCommand: (index: number, value: string) => void
}

export function CommandsSection({ commands, addCommand, removeCommand, updateCommand }: CommandsSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Commands</Label>
        <Button type="button" variant="outline" size="sm" onClick={addCommand}>
          <Plus className="mr-2 h-4 w-4" />
          Add Command
        </Button>
      </div>
      <div className="space-y-2">
        {commands.map((command, index) => (
          <div key={index} className="flex gap-2 animate-in fade-in-50">
            <Input
              placeholder={`e.g., npm test${index > 0 ? ` (command ${index + 1})` : ""}`}
              value={command}
              onChange={(e) => updateCommand(index, e.target.value)}
              required={index === 0}
              className="transition-all focus-visible:ring-primary"
            />
            {index > 0 && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => removeCommand(index)}
                className="hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Remove command</span>
              </Button>
            )}
          </div>
        ))}
        <p className="text-sm text-muted-foreground">
          Commands will be executed in sequence. First command is required.
        </p>
      </div>
    </div>
  )
}