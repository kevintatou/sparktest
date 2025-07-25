"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { storage } from "@sparktest/storage-service"
import type { TestSuite, Definition } from "@sparktest/core/types"

interface FormData {
  id: string
  name: string
  description: string
  testDefinitionIds: string[]
  executionMode: "sequential" | "parallel"
  labels: string[]
}

export function useSuiteForm(existingSuite?: TestSuite) {
  const router = useRouter()
  const { toast } = useToast()
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [definitions, setDefinitions] = useState<Definition[]>([])
  const [formData, setFormData] = useState<FormData>({
    id: existingSuite?.id || "",
    name: existingSuite?.name || "",
    description: existingSuite?.description || "",
    testDefinitionIds: existingSuite?.testDefinitionIds || [],
    executionMode: existingSuite?.executionMode || "sequential",
    labels: existingSuite?.labels || [],
  })
  const [newLabel, setNewLabel] = useState("")

  // Load test definitions on mount
  useEffect(() => {
    const loadDefinitions = async () => {
      const defs = await storage.getDefinitions()
      setDefinitions(defs)
    }
    loadDefinitions()
  }, [])

  const addLabel = useCallback(() => {
    if (newLabel.trim() && !formData.labels.includes(newLabel.trim())) {
      setFormData((prev) => ({
        ...prev,
        labels: [...prev.labels, newLabel.trim()],
      }))
      setNewLabel("")
    }
  }, [newLabel, formData.labels])

  const removeLabel = useCallback((labelToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      labels: prev.labels.filter((label) => label !== labelToRemove),
    }))
  }, [])

  const toggleDefinition = useCallback((definitionId: string) => {
    setFormData((prev) => ({
      ...prev,
      testDefinitionIds: prev.testDefinitionIds.includes(definitionId)
        ? prev.testDefinitionIds.filter((id) => id !== definitionId)
        : [...prev.testDefinitionIds, definitionId],
    }))
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
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
  }, [formData, existingSuite, toast, router])

  return {
    // State
    isSubmitting,
    definitions,
    formData,
    setFormData,
    newLabel,
    setNewLabel,
    
    // Actions
    addLabel,
    removeLabel,
    toggleDefinition,
    handleSubmit,
  }
}