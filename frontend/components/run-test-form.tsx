"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { createTestRun } from "@/lib/storage-service"
import type { TestDefinition } from "@/lib/types"

export function RunTestForm({ testDefinition }: { testDefinition: TestDefinition }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: `${testDefinition.name} Run`,
    image: testDefinition.image,
    commands: [...testDefinition.commands],
    useCustomSettings: false,
  })

  const addCommand = () => {
    setFormData((prev) => ({
      ...prev,
      commands: [...prev.commands, ""],
    }))
  }

  const removeCommand = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      commands: prev.commands.filter((_, i) => i !== index),
    }))
  }

  const updateCommand = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      commands: prev.commands.map((cmd, i) => (i === index ? value : cmd)),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Create a new test run in localStorage
      const options = formData.useCustomSettings
        ? {
            name: formData.name,
            image: formData.image,
            commands: formData.commands.filter(Boolean),
          }
        : { name: formData.name }

      const newRun = createTestRun(testDefinition.id, options)

      toast({
        title: "Test started successfully",
        description: `Test "${newRun.name}" is now running.`,
      })

      router.push(`/tests/${newRun.id}`)
    } catch (error) {
      toast({
        title: "Error starting test",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Run Test: {testDefinition.name}</CardTitle>
          <CardDescription>{testDefinition.description}</CardDescription>
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
              onCheckedChange={(checked) => setFormData({ ...formData, useCustomSettings: checked })}
            />
            <Label htmlFor="custom-settings">Use custom settings for this run</Label>
          </div>

          {formData.useCustomSettings ? (
            <div className="animate-in fade-in-50 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="image">Container Image</Label>
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
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
                  <Button type="button" variant="outline" size="sm" onClick={addCommand}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Command
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.commands.map((command, index) => (
                    <div key={index} className="flex gap-2 animate-in fade-in-50">
                      <Input
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
            </div>
          ) : (
            <div className="space-y-4 border rounded-md p-4 bg-muted/30 animate-in fade-in-50">
              <h3 className="font-medium">Default Settings</h3>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">Image:</span> {testDefinition.image}
                </p>
                <div>
                  <span className="font-medium">Commands:</span>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    {testDefinition.commands.map((cmd, i) => (
                      <li key={i}>{cmd}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
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
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
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
