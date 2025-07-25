"use client"

import { Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

interface LabelsSectionProps {
  labels: string[]
  newLabel: string
  setNewLabel: (label: string) => void
  addLabel: () => void
  removeLabel: (label: string) => void
}

export function LabelsSection({
  labels,
  newLabel,
  setNewLabel,
  addLabel,
  removeLabel,
}: LabelsSectionProps) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addLabel()
    }
  }

  return (
    <div className="space-y-4">
      <Label>Labels</Label>
      <div className="flex gap-2">
        <Input
          placeholder="Add a label..."
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <Button type="button" variant="outline" onClick={addLabel}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {labels.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {labels.map((label) => (
            <Badge key={label} variant="secondary" className="flex items-center gap-1">
              {label}
              <X
                className="h-3 w-3 cursor-pointer hover:text-red-500"
                onClick={() => removeLabel(label)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
