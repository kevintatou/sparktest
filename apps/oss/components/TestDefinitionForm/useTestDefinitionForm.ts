"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { storage } from "@sparktest/storage-service"
import type { Executor } from "@sparktest/core/types"

interface FormData {
  name: string
  description: string
  image: string
  commands: string[]
  executorId: string
}

export function useTestDefinitionForm(existingTest?: any) {
  const router = useRouter()
  const { toast } = useToast()
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tab, setTab] = useState("manual")
  const [executors, setExecutors] = useState<Executor[]>([])
  const [isLoadingExecutors, setIsLoadingExecutors] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    name: existingTest?.name || "",
    description: existingTest?.description || "",
    image: existingTest?.image || "",
    commands: existingTest?.commands || [""],
    executorId: existingTest?.executorId ? existingTest.executorId : "none",
  })
  const [githubUrl, setGithubUrl] = useState("")
  const [githubPath, setGithubPath] = useState("/tests")

  // Fetch executors on mount
  useEffect(() => {
    const fetchExecutors = async () => {
      setIsLoadingExecutors(true)
      try {
        const data = await storage.getExecutors()
        setExecutors(data)
      } catch (error) {
        console.error("Failed to fetch executors:", error)
        toast({
          title: "Error fetching executors",
          description: "Failed to load available executors. You can still create a test definition without selecting an executor.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingExecutors(false)
      }
    }
    fetchExecutors()
  }, [toast])

  // Auto-populate image and commands when executor is selected
  useEffect(() => {
    if (formData.executorId && formData.executorId !== "none" && executors.length > 0) {
      const selectedExecutor = executors.find(e => e.id === formData.executorId)
      if (selectedExecutor) {
        setFormData(prev => ({
          ...prev,
          image: selectedExecutor.image,
          commands: selectedExecutor.command && selectedExecutor.command.length > 0 
            ? selectedExecutor.command 
            : ["echo hello"]
        }))
      }
    }
  }, [formData.executorId, executors])

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

  const updateCommand = useCallback((index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      commands: prev.commands.map((cmd, i) => (i === index ? value : cmd)),
    }))
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Save to localStorage
      const submissionData = {
        ...formData,
        commands: formData.commands.filter(Boolean),
        createdAt: existingTest?.createdAt || new Date().toISOString(),
        executorId: formData.executorId === "none" ? undefined : formData.executorId,
      }
      storage.saveDefinition(submissionData)

      toast({
        title: existingTest ? "Test definition updated" : "Test definition created",
        description: `Test "${formData.name}" has been ${existingTest ? "updated" : "created"} successfully.`,
      })

      router.push("/definitions")
    } catch (error) {
      toast({
        title: `Error ${existingTest ? "updating" : "creating"} test definition`,
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, existingTest, toast, router])

  const handleGithubSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      // Here you would call your backend API to trigger a sync for this repo
      // For now, just show a toast
      toast({
        title: "GitHub Sync Triggered",
        description: `Syncing definitions from ${githubUrl}${githubPath}`,
      })
      router.push("/definitions")
    } catch (error) {
      toast({
        title: "Error syncing from GitHub",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }, [githubUrl, githubPath, toast, router])

  return {
    // State
    isSubmitting,
    tab,
    setTab,
    executors,
    isLoadingExecutors,
    formData,
    setFormData,
    githubUrl,
    setGithubUrl,
    githubPath,
    setGithubPath,
    
    // Actions
    addCommand,
    removeCommand,
    updateCommand,
    handleSubmit,
    handleGithubSubmit,
  }
}