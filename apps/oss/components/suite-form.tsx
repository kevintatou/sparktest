"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { storage } from "@sparktest/storage-service"
import type { TestSuite, Definition } from "@sparktest/core/types"
import { Autocomplete } from "@/components/ui/autocomplete"

interface SuiteFormProps {
  existingSuite?: TestSuite
}

export function SuiteForm({ existingSuite }: SuiteFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [definitions, setDefinitions] = useState<Definition[]>([])
  const [formData, setFormData] = useState({
    id: existingSuite?.id || "",
    name: existingSuite?.name || "",
    description: existingSuite?.description || "",
    testDefinitionIds: existingSuite?.testDefinitionIds || [],
    executionMode: existingSuite?.executionMode || ("sequential" as "sequential" | "parallel"),
    labels: existingSuite?.labels || [],
  })
  const [newLabel, setNewLabel] = useState("")

  useEffect(() => {
    const loadDefinitions = async () => {
      const defs = await storage.getDefinitions()
      setDefinitions(defs)
    }
    loadDefinitions()
  }, [])

  const addLabel = () => {
    if (newLabel.trim() && !formData.labels.includes(newLabel.trim())) {
      setFormData((prev) => ({
        ...prev,
        labels: [...prev.labels, newLabel.trim()],
      }))
      setNewLabel("")
    }
  }

  const removeLabel = (labelToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      labels: prev.labels.filter((label) => label !== labelToRemove),
    }))
  }

  const toggleDefinition = (definitionId: string) => {
    setFormData((prev) => ({
      ...prev,
      testDefinitionIds: prev.testDefinitionIds.includes(definitionId)
        ? prev.testDefinitionIds.filter((id) => id !== definitionId)
        : [...prev.testDefinitionIds, definitionId],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate form data
      if (formData.testDefinitionIds.length === 0) {
        throw new Error("Please select at least one test definition")
      }
      
      const suiteData: TestSuite = {
        ...formData,
        createdAt: existingSuite?.createdAt || new Date().toISOString(),
      }

      // Save the suite using the storage service
      await storage.saveTestSuite(suiteData)

      toast({
        title: existingSuite ? "Suite updated" : "Suite created",
        description: `Test suite "${formData.name}" has been ${existingSuite ? "updated" : "created"} successfully.`,
      })

      router.push("/suites")
    } catch (error) {
      console.error("Error saving test suite:", error)
      toast({
        title: `Error ${existingSuite ? "updating" : "creating"} suite`,
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
          <CardTitle>{existingSuite ? "Edit" : "Create"} Test Suite</CardTitle>
          <CardDescription>
            {existingSuite
              ? "Update this test suite configuration"
              : "Create a test suite to group related test definitions together."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* <div className="space-y-2">
            <Label htmlFor="id">Suite ID</Label>
            <Input
              id="id"
              placeholder="e.g., api-integration-suite"
              value={formData.id}
              onChange={(e) => setFormData({ ...formData, id: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
              required
              disabled={!!existingSuite}
              className="transition-all focus-visible:ring-primary"
            />
            <p className="text-sm text-muted-foreground">A unique identifier for this suite (lowercase, no spaces)</p>
          </div> */}

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
              onValueChange={(value: "sequential" | "parallel") => setFormData({ ...formData, executionMode: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sequential">Sequential - Run tests one after another</SelectItem>
                <SelectItem value="parallel">Parallel - Run tests simultaneously</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <Label>Test Definitions</Label>
            <Autocomplete
              options={definitions}
              getOptionLabel={(option) => option.name}
              multiple
              value={definitions.filter((d) => formData.testDefinitionIds.includes(d.id))}
              onChange={(_, value) => setFormData((prev) => ({
                ...prev,
                testDefinitionIds: value.map((d) => d.id),
              }))}
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
              Selected {formData.testDefinitionIds.length} test definition(s)
            </p>
          </div>

          <div className="space-y-4">
            <Label>Labels</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a label..."
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addLabel())}
              />
              <Button type="button" variant="outline" onClick={addLabel}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formData.labels.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.labels.map((label) => (
                  <Badge key={label} variant="secondary" className="flex items-center gap-1">
                    {label}
                    <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => removeLabel(label)} />
                  </Badge>
                ))}
              </div>
            )}
          </div>
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
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
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
