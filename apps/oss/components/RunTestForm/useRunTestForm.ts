"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useCreateRun } from "@/hooks/use-queries"
import { useToast } from "@/components/ui/use-toast"
import type { Definition } from "@tatou/core/types"

interface UseRunTestFormProps {
  definition?: Definition
}

export interface UseRunTestFormReturn {
  formData: {
    name: string
    useCustomSettings: boolean
    customImage: string
    customCommands: string[]
  }
  setFormData: React.Dispatch<
    React.SetStateAction<{
      name: string
      useCustomSettings: boolean
      customImage: string
      customCommands: string[]
    }>
  >
  isLoading: boolean
  isSubmitting: boolean
  onSubmit: (e: React.FormEvent) => void
  addCustomCommand: () => void
  removeCustomCommand: (index: number) => void
  updateCustomCommand: (index: number, value: string) => void
}

export function useRunTestForm({ definition }: UseRunTestFormProps): UseRunTestFormReturn {
  const router = useRouter()
  const { toast } = useToast()
  const createRun = useCreateRun()

  const [formData, setFormData] = useState({
    name: definition?.name ? `${definition.name} - ${new Date().toLocaleString()}` : "",
    useCustomSettings: false,
    customImage: definition?.image || "",
    customCommands: definition?.commands || [""],
  })

  const isLoading = !definition
  const isSubmitting = createRun.isPending

  const addCustomCommand = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      customCommands: [...prev.customCommands, ""],
    }))
  }, [])

  const removeCustomCommand = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      customCommands: prev.customCommands.filter((_, i) => i !== index),
    }))
  }, [])

  const updateCustomCommand = useCallback((index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      customCommands: prev.customCommands.map((cmd, i) => (i === index ? value : cmd)),
    }))
  }, [])

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      if (!definition) {
        toast({
          title: "Error",
          description: "No test definition found",
          variant: "destructive",
        })
        return
      }

      try {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const runData = {
          definitionId: definition.id,
          name: formData.name,
          ...(formData.useCustomSettings && {
            image: formData.customImage,
            commands: formData.customCommands.filter((cmd) => cmd.trim() !== ""),
          }),
        }

        await createRun.mutateAsync(definition.id)

        toast({
          title: "Test Run Started",
          description: `Test run "${formData.name}" has been started successfully.`,
        })

        router.push("/runs")
      } catch (error) {
        toast({
          title: "Failed to Start Test Run",
          description: error instanceof Error ? error.message : "An unexpected error occurred",
          variant: "destructive",
        })
      }
    },
    [definition, formData, createRun, toast, router]
  )

  return {
    formData,
    setFormData,
    isLoading,
    isSubmitting,
    onSubmit,
    addCustomCommand,
    removeCustomCommand,
    updateCustomCommand,
  }
}
