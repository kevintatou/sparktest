"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useRunTestForm } from "./useRunTestForm"
import { LoadingState } from "./LoadingState"
import { DefaultSettingsDisplay } from "./DefaultSettingsDisplay"
import { CustomSettingsSection } from "./CustomSettingsSection"
import type { Definition } from "@tatou/core/types"

interface RunTestFormProps {
  def: Definition
}

export function RunTestForm({ def: definition }: RunTestFormProps) {
  const router = useRouter()
  const {
    isSubmitting,
    formData,
    setFormData,
    addCommand,
    removeCommand,
    updateCommand,
    handleSubmit,
  } = useRunTestForm(definition)

  if (!formData) {
    return <LoadingState />
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Run Test: {definition.name}</CardTitle>
          <CardDescription>{definition.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Run Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="transition-all focus-visible:ring-primary"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="custom-settings"
              checked={formData.useCustomSettings}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, useCustomSettings: checked })
              }
            />
            <Label htmlFor="custom-settings">Use custom settings for this run</Label>
          </div>

          {formData.useCustomSettings ? (
            <CustomSettingsSection
              image={formData.image}
              commands={formData.commands}
              onImageChange={(image) => setFormData({ ...formData, image })}
              onAddCommand={addCommand}
              onRemoveCommand={removeCommand}
              onUpdateCommand={updateCommand}
            />
          ) : (
            <DefaultSettingsDisplay definition={definition} />
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" type="button" onClick={() => router.push("/runs")}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="shadow-sm">
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
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Starting...
              </>
            ) : (
              "Run Test"
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}

// Re-export for backward compatibility
export default RunTestForm
