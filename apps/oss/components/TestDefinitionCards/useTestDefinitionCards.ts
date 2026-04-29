"use client"

import { useState } from "react"
import { useCreateRun, useDefinitions } from "@/hooks/use-queries"
import type { Definition } from "@tatou/core/types"

export function useDefinitionCards() {
  const { data: testDefinitions = [] } = useDefinitions()
  const createRunMutation = useCreateRun()
  const [runningTests, setRunningTests] = useState<string[]>([])
  const [testModalOpen, setTestModalOpen] = useState(false)
  const [selectedTest, setSelectedTest] = useState<Definition | null>(null)

  const handleQuickRun = async (definitionId: string) => {
    setRunningTests((prev) => [...prev, definitionId])
    try {
      await createRunMutation.mutateAsync(definitionId)
    } finally {
      setRunningTests((prev) => prev.filter((id) => id !== definitionId))
    }
  }

  const handleTestWithModal = (definition: Definition) => {
    setSelectedTest(definition)
    setTestModalOpen(true)
  }

  const closeModal = () => {
    setTestModalOpen(false)
    setSelectedTest(null)
  }

  return {
    runningTests,
    testDefinitions,
    testModalOpen,
    selectedTest,
    handleQuickRun,
    handleTestWithModal,
    closeModal,
  }
}
