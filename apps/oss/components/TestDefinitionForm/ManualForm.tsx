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
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CommandsSection } from "./CommandsSection"
import type { Executor, Definition } from "@tatou/core/types"

interface FormData {
  name: string
  description: string
  image: string
  commands: string[]
  executorId: string
}

interface ManualFormProps {
  formData: FormData
  setFormData: (data: FormData) => void
  executors: Executor[]
  isLoadingExecutors: boolean
  isSubmitting: boolean
  handleSubmit: (e: React.FormEvent) => void
  addCommand: () => void
  removeCommand: (index: number) => void
  updateCommand: (index: number, value: string) => void
  existingTest?: Definition
}

export function ManualForm({
  formData,
  setFormData,
  executors,
  isLoadingExecutors,
  isSubmitting,
  handleSubmit,
  addCommand,
  removeCommand,
  updateCommand,
  existingTest,
}: ManualFormProps) {
  const router = useRouter()

  return (
    <form onSubmit={handleSubmit}>
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>{existingTest ? "Edit" : "Create"} Test Definition</CardTitle>
          <CardDescription>
            {existingTest
              ? "Update this test definition"
              : "Create a reusable test definition that can be executed on demand or scheduled."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Test Name</Label>
            <Input
              id="name"
              placeholder="e.g., API Integration Tests"
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
              placeholder="Describe what this test does..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="transition-all focus-visible:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="executor">Executor (Optional)</Label>
            <Select
              value={formData.executorId}
              onValueChange={(value) =>
                setFormData({ ...formData, executorId: value === "none" ? "" : value })
              }
              disabled={isLoadingExecutors}
            >
              <SelectTrigger className="transition-all focus-visible:ring-primary">
                <SelectValue
                  placeholder={
                    isLoadingExecutors ? "Loading executors..." : "Select an executor (optional)"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  <div className="flex flex-col">
                    <span>No executor (custom)</span>
                    <span className="text-xs text-muted-foreground">
                      Use custom image and commands
                    </span>
                  </div>
                </SelectItem>
                {executors.map((executor) => (
                  <SelectItem key={executor.id} value={executor.id}>
                    <div className="flex flex-col">
                      <span>{executor.name}</span>
                      <span className="text-xs text-muted-foreground">{executor.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Select a pre-configured executor to automatically populate image and commands, or
              leave empty for custom configuration.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Container Image</Label>
            <Input
              id="image"
              placeholder="e.g., node:18-alpine"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              required
              className="transition-all focus-visible:ring-primary"
            />
            <p className="text-sm text-muted-foreground">
              The Docker image that contains your test code and dependencies
            </p>
          </div>

          <CommandsSection
            commands={formData.commands}
            addCommand={addCommand}
            removeCommand={removeCommand}
            updateCommand={updateCommand}
          />
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" type="button" onClick={() => router.push("/tests")}>
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
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {existingTest ? "Updating..." : "Creating..."}
              </>
            ) : existingTest ? (
              "Update Test Definition"
            ) : (
              "Create Test Definition"
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
