"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { useExecutors } from "@/hooks/use-queries"
import type { Executor } from "@tatou/core/types"

interface TestDefinition {
  id?: string
  name: string
  description: string
  image: string
  commands: string[]
  executorId: string
}

interface UseTestDefinitionFormProps {
  initialDefinition?: TestDefinition
  mode: "create" | "edit"
}

export interface UseTestDefinitionFormReturn {
  formData: TestDefinition
  setFormData: React.Dispatch<React.SetStateAction<TestDefinition>>
  isSubmitting: boolean
  errors: Record<string, string>
  executors: Executor[]
  isLoadingExecutors: boolean
  tab: string
  setTab: (tab: string) => void
  githubUrl: string
  setGithubUrl: (url: string) => void
  githubPath: string
  setGithubPath: (path: string) => void
  onSubmit: (e: React.FormEvent) => void
  handleSubmit: (e: React.FormEvent) => void
  handleGithubSubmit: (e: React.FormEvent) => void
  updateField: <K extends keyof TestDefinition>(field: K, value: TestDefinition[K]) => void
  addCommand: () => void
  removeCommand: (index: number) => void
  updateCommand: (index: number, value: string) => void
}

export function useTestDefinitionForm({
  initialDefinition,
  mode,
}: UseTestDefinitionFormProps): UseTestDefinitionFormReturn {
  const router = useRouter()
  const { toast } = useToast()
  const { data: executors = [], isLoading: isLoadingExecutors } = useExecutors()

  const [formData, setFormData] = useState<TestDefinition>({
    name: initialDefinition?.name || "",
    description: initialDefinition?.description || "",
    image: initialDefinition?.image || "",
    commands: initialDefinition?.commands || [""],
    executorId: initialDefinition?.executorId || "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [tab, setTab] = useState("manual")
  const [githubUrl, setGithubUrl] = useState("")
  const [githubPath, setGithubPath] = useState("")

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Test name is required"
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required"
    }

    if (!formData.image.trim()) {
      newErrors.image = "Docker image is required"
    }

    if (!formData.executorId) {
      newErrors.executorId = "Executor selection is required"
    }

    const validCommands = formData.commands.filter((cmd) => cmd.trim() !== "")
    if (validCommands.length === 0) {
      newErrors.commands = "At least one command is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  const updateField = useCallback(
    <K extends keyof TestDefinition>(field: K, value: TestDefinition[K]) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }))

      // Clear error for this field
      if (errors[field]) {
        setErrors((prev) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [field]: removed, ...rest } = prev
          return rest
        })
      }
    },
    [errors]
  )

  const addCommand = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      commands: [...prev.commands, ""],
    }))
  }, [])

  const removeCommand = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      commands: prev.commands.filter((_, i) => i !== index),
    }))
  }, [])

  const updateCommand = useCallback(
    (index: number, value: string) => {
      setFormData((prev) => ({
        ...prev,
        commands: prev.commands.map((cmd, i) => (i === index ? value : cmd)),
      }))

      // Clear commands error if user is adding content
      if (errors.commands && value.trim()) {
        setErrors((prev) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { commands, ...rest } = prev
          return rest
        })
      }
    },
    [errors]
  )

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      if (!validateForm()) {
        return
      }

      setIsSubmitting(true)

      try {
        // Filter out empty commands
        const cleanedFormData = {
          ...formData,
          commands: formData.commands.filter((cmd) => cmd.trim() !== ""),
        }

        const url =
          mode === "create"
            ? "/api/test-definitions"
            : `/api/test-definitions/${initialDefinition?.id}`
        const method = mode === "create" ? "POST" : "PUT"

        const response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(cleanedFormData),
        })

        if (!response.ok) {
          throw new Error(`Failed to ${mode} test definition`)
        }

        toast({
          title: `Test Definition ${mode === "create" ? "Created" : "Updated"}`,
          description: `Test definition "${formData.name}" has been ${mode === "create" ? "created" : "updated"} successfully.`,
        })

        router.push("/definitions")
      } catch (error) {
        toast({
          title: `Failed to ${mode} Test Definition`,
          description: error instanceof Error ? error.message : "An unexpected error occurred",
          variant: "destructive",
        })
      } finally {
        setIsSubmitting(false)
      }
    },
    [formData, validateForm, mode, initialDefinition, toast, router]
  )

  const handleSubmit = onSubmit
  const handleGithubSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      // GitHub form submission logic would go here
      toast({
        title: "GitHub Integration",
        description: "GitHub-backed test definitions are not yet implemented.",
        variant: "destructive",
      })
    },
    [toast]
  )

  return {
    formData,
    setFormData,
    isSubmitting,
    errors,
    executors,
    isLoadingExecutors,
    tab,
    setTab,
    githubUrl,
    setGithubUrl,
    githubPath,
    setGithubPath,
    onSubmit,
    handleSubmit,
    handleGithubSubmit,
    updateField,
    addCommand,
    removeCommand,
    updateCommand,
  }
}
