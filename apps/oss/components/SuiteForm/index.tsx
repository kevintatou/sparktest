"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useSuiteForm } from "./useSuiteForm"
import { LabelsSection } from "./LabelsSection"
import { DefinitionsSelector } from "./TestDefinitionsSelector"
import { getExecutionModeDescription } from "./suiteUtils"
import type { Suite, Definition } from "@tatou/core/types"

interface SuiteFormProps {
  existingSuite?: Suite
}

export function SuiteForm({ existingSuite }: SuiteFormProps) {
  const router = useRouter()
  const {
    isSubmitting,
    definitions,
    formData,
    setFormData,
    newLabel,
    setNewLabel,
    addLabel,
    removeLabel,
    handleSubmit,
  } = useSuiteForm(existingSuite)

  // Memoize execution mode options
  const executionModeOptions = useMemo(
    () => [
      { value: "sequential", label: getExecutionModeDescription("sequential") },
      { value: "parallel", label: getExecutionModeDescription("parallel") },
    ],
    []
  )

  const handleDefinitionsChange = (selectedDefinitions: Definition[]) => {
    setFormData((prev) => ({
      ...prev,
      testDefinitionIds: selectedDefinitions.map((d) => d.id),
    }))
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="shadow-sm">
        <CardContent className="space-y-6 pt-8">
          <div className="space-y-2">
            <Label htmlFor="name">Suite Name</Label>
            <Input
              id="name"
              placeholder="e.g., API Integration Test Suite"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="transition-all focus-visible:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what this test suite covers..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="transition-all focus-visible:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <Label>Execution Mode</Label>
            <Select
              value={formData.executionMode}
              onValueChange={(value: "sequential" | "parallel") =>
                setFormData({ ...formData, executionMode: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {executionModeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DefinitionsSelector
            definitions={definitions}
            selectedIds={formData.testDefinitionIds}
            onSelectionChange={handleDefinitionsChange}
          />

          <LabelsSection
            labels={formData.labels}
            newLabel={newLabel}
            setNewLabel={setNewLabel}
            addLabel={addLabel}
            removeLabel={removeLabel}
          />
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" type="button" onClick={() => router.push("/suites")}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || formData.testDefinitionIds.length === 0}>
            {isSubmitting ? (
              <>
                <svg
                  className="mr-2 h-4 w-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {existingSuite ? "Updating..." : "Creating..."}
              </>
            ) : existingSuite ? (
              "Update Suite"
            ) : (
              "Create Suite"
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}

// Re-export for backward compatibility
export default SuiteForm
