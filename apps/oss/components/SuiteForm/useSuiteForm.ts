"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

interface TestSuite {
  id?: string
  name: string
  description: string
  executionMode: "parallel" | "sequential"
  labels: string[]
  testDefinitionIds: string[]
}

import type { Suite, Definition } from "@tatou/core/types"
import { useDefinitions } from "@/hooks/use-queries"

export interface UseSuiteFormReturn {
  formData: TestSuite
  setFormData: React.Dispatch<React.SetStateAction<TestSuite>>
  isSubmitting: boolean
  definitions: Definition[]
  newLabel: string
  setNewLabel: (label: string) => void
  errors: Record<string, string>
  addLabel: (label: string) => void
  removeLabel: (index: number) => void
  handleSubmit: (e: React.FormEvent) => void
}

export function useSuiteForm(existingSuite?: Suite): UseSuiteFormReturn {
  const router = useRouter()
  const { toast } = useToast()
  const { data: definitions = [] } = useDefinitions()
  
  const mode = existingSuite ? "edit" : "create"

  const [formData, setFormData] = useState<TestSuite>({
    name: existingSuite?.name || "",
    description: existingSuite?.description || "",
    executionMode: existingSuite?.executionMode || "sequential",
    labels: existingSuite?.labels || [],
    testDefinitionIds: existingSuite?.testDefinitionIds || []
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [newLabel, setNewLabel] = useState("")

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Suite name is required"
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required"
    }

    if (formData.testDefinitionIds.length === 0) {
      newErrors.testDefinitions = "At least one test definition is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  const updateField = useCallback(<K extends keyof TestSuite>(field: K, value: TestSuite[K]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }, [])

  const addLabel = useCallback((label: string) => {
    const trimmed = label.trim().toLowerCase()
    if (trimmed && !formData.labels.includes(trimmed)) {
      setFormData(prev => ({
        ...prev,
        labels: [...prev.labels, trimmed]
      }))
    }
  }, [formData.labels])

  const removeLabel = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      labels: prev.labels.filter((_, i) => i !== index)
    }))
  }, [])

  const addDefinition = useCallback((definitionId: string) => {
    if (!formData.testDefinitionIds.includes(definitionId)) {
      setFormData(prev => ({
        ...prev,
        testDefinitionIds: [...prev.testDefinitionIds, definitionId]
      }))
    }
  }, [formData.testDefinitionIds])

  const removeDefinition = useCallback((definitionId: string) => {
    setFormData(prev => ({
      ...prev,
      testDefinitionIds: prev.testDefinitionIds.filter(id => id !== definitionId)
    }))
  }, [])

  const onSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const url = mode === "create" ? "/api/test-suites" : `/api/test-suites/${existingSuite?.id}`
      const method = mode === "create" ? "POST" : "PUT"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error(`Failed to ${mode} suite`)
      }

      toast({
        title: `Suite ${mode === "create" ? "Created" : "Updated"}`,
        description: `Test suite "${formData.name}" has been ${mode === "create" ? "created" : "updated"} successfully.`
      })

      router.push("/suites")
    } catch (error) {
      toast({
        title: `Failed to ${mode} Suite`,
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, validateForm, mode, existingSuite, toast, router])

  const handleSubmit = onSubmit

  return {
    formData,
    setFormData,
    isSubmitting,
    definitions,
    newLabel,
    setNewLabel,
    errors,
    addLabel,
    removeLabel,
    handleSubmit
  }
}
