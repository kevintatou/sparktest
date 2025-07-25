"use client"

import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface CustomSettingsSectionProps {
  image: string
  commands: string[]
  onImageChange: (image: string) => void
  onAddCommand: () => void
  onRemoveCommand: (index: number) => void
  onUpdateCommand: (index: number, value: string) => void
}

export function CustomSettingsSection({
  image,
  commands,
  onImageChange,
  onAddCommand,
  onRemoveCommand,
  onUpdateCommand,
}: CustomSettingsSectionProps) {
  return (
    <div className="animate-in fade-in-50 space-y-6">
      <div className="space-y-2">
        <Label htmlFor="image">Container Image</Label>
        <Input
          id="image"
          value={image}
          onChange={(e) => onImageChange(e.target.value)}
          required
          className="transition-all focus-visible:ring-primary"
        />
        <p className="text-sm text-muted-foreground">
          The Docker image that contains your test code and dependencies
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Commands</Label>
          <Button type="button" variant="outline" size="sm" onClick={onAddCommand}>
            <Plus className="mr-2 h-4 w-4" />
            Add Command
          </Button>
        </div>
        <div className="space-y-2">
          {commands.map((command, index) => (
            <div key={index} className="flex gap-2 animate-in fade-in-50">
              <Input
                value={command}
                onChange={(e) => onUpdateCommand(index, e.target.value)}
                required={index === 0}
                className="transition-all focus-visible:ring-primary"
              />
              {index > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => onRemoveCommand(index)}
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
    </div>
  )
}