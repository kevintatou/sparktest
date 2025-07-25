"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Autocomplete } from "@/components/ui/autocomplete"
import type { Definition } from "@sparktest/core/types"

interface TestDefinitionsSelectorProps {
  definitions: Definition[]
  selectedIds: string[]
  onSelectionChange: (selectedDefinitions: Definition[]) => void
}

export function TestDefinitionsSelector({
  definitions,
  selectedIds,
  onSelectionChange,
}: TestDefinitionsSelectorProps) {
  const selectedDefinitions = definitions.filter((d) => selectedIds.includes(d.id))

  return (
    <div className="space-y-4">
      <Label>Test Definitions</Label>
      <Autocomplete
        options={definitions}
        getOptionLabel={(option) => option.name}
        multiple
        value={selectedDefinitions}
        onChange={(_, value) => onSelectionChange(value)}
        renderInput={(params) => (
          <Input {...params} placeholder="Search and select test definitions..." />
        )}
        renderOption={(props, option) => (
          <li {...props} key={option.id} className="flex flex-col p-2">
            <span className="font-medium">{option.name}</span>
            <span className="text-xs text-muted-foreground">{option.description}</span>
          </li>
        )}
      />
      <p className="text-sm text-muted-foreground">
        Selected {selectedIds.length} test definition(s)
      </p>
    </div>
  )
}
