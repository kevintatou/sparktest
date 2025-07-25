"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2 } from "lucide-react"

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
import { useToast } from "@/components/ui/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function NewTestForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [testDefinitions, setTestDefinitions] = useState<{ id: string; name: string }[]>([])
  const [selectedTestDefId, setSelectedTestDefId] = useState<string>("")

  const [formData, setFormData] = useState({
    name: "",
    image: "",
    commands: [""],
  })

  useEffect(() => {
    const fetchDefs = async () => {
      const res = await fetch("http://localhost:3001/api/test-definitions")
      const defs = await res.json()
      setTestDefinitions(defs)
    }
    fetchDefs()
  }, [])

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
      const response = await fetch("http://localhost:3001/api/test-runs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          test_definition_id: selectedTestDefId,
          name: formData.name,
          image: formData.image,
          commands: formData.commands.filter(Boolean),
        }),
      })

      if (!response.ok) throw new Error("Failed to create test")

      const data = await response.json()

      toast({
        title: "Test created successfully",
        description: `Test ID: ${data.id}`,
      })

      router.push("/")
    } catch (error) {
      toast({
        title: "Error creating test",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Test Configuration</CardTitle>
          <CardDescription>
            Configure your test to run in Kubernetes. SparkTest will create a job based on these
            settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="test-def">Test Definition</Label>
            <Select onValueChange={setSelectedTestDefId}>
              <SelectTrigger id="test-def">
                <SelectValue placeholder="Select a test definition" />
              </SelectTrigger>
              <SelectContent>
                {testDefinitions.map((def) => (
                  <SelectItem key={def.id} value={def.id}>
                    {def.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Test Name</Label>
            <Input
              id="name"
              placeholder="e.g., api-integration-tests"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Container Image</Label>
            <Input
              id="image"
              placeholder="e.g., node:18-alpine"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              required
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
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={`e.g., npm test${index > 0 ? ` (command ${index + 1})` : ""}`}
                    value={command}
                    onChange={(e) => updateCommand(index, e.target.value)}
                    required={index === 0}
                  />
                  {index > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeCommand(index)}
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
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" type="button" onClick={() => router.push("/")}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Test"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
