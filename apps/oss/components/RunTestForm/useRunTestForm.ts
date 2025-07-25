"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { storage } from "@sparktest/storage-service"
import type { Definition } from "@sparktest/core/types"

interface FormData {
  name: string
  image: string
  commands: string[]
  useCustomSettings: boolean
}

export function useRunTestForm(definition: Definition) {
  const router = useRouter()
  const { toast } = useToast()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<FormData | null>(null)

  // Initialize form data when definition is available
  useEffect(() => {
    if (!definition) return
    setFormData({
      name: `${definition.name} Run`,
      image: definition.image,
      commands: [...definition.commands],
      useCustomSettings: false,
    })
  }, [definition])

  const addCommand = useCallback(() => {
    if (!formData) return
    setFormData({
      ...formData,
      commands: [...formData.commands, ""],
    })
  }, [formData])

  const removeCommand = useCallback(
    (index: number) => {
      if (!formData) return
      setFormData({
        ...formData,
        commands: formData.commands.filter((_, i) => i !== index),
      })
    },
    [formData]
  )

  const updateCommand = useCallback(
    (index: number, value: string) => {
      if (!formData) return
      setFormData({
        ...formData,
        commands: formData.commands.map((cmd, i) => (i === index ? value : cmd)),
      })
    },
    [formData]
  )

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!formData) return

      setIsSubmitting(true)

      try {
        const options = formData.useCustomSettings
          ? {
              name: formData.name,
              image: formData.image,
              commands: formData.commands.filter(Boolean),
            }
          : { name: formData.name }

        const newRun = await storage.createRun(definition.id, options)

        if (!newRun || !newRun.id) {
          console.error("createRun did not return a valid run object:", newRun)
          toast({
            title: "Error starting test",
            description: "Failed to create test run: missing run ID.",
            variant: "destructive",
          })
          setIsSubmitting(false)
          return
        }

        toast({
          title: "Test started successfully",
          description: `Test "${newRun.name}" is now running. You can monitor its progress on the runs page.`,
          duration: 4000,
        })

        router.push(`/runs/${newRun.id}`)
      } catch (error) {
        toast({
          title: "Error starting test",
          description: error instanceof Error ? error.message : "Unknown error occurred",
          variant: "destructive",
        })
      } finally {
        setIsSubmitting(false)
      }
    },
    [formData, definition.id, toast, router]
  )

  return {
    // State
    isSubmitting,
    formData,
    setFormData,

    // Actions
    addCommand,
    removeCommand,
    updateCommand,
    handleSubmit,
  }
}
