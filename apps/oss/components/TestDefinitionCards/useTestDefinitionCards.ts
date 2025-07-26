import { useState, useEffect, useRef, useCallback } from "react"
import { storage } from "@tatou/storage-service"
import { useToast } from "@/components/ui/use-toast"
import type { Definition } from "@tatou/core/types"

export function useDefinitionCards() {
  const { toast } = useToast()
  const [runningTests, setRunningTests] = useState<string[]>([])
  const [testDefinitions, setDefinitions] = useState<Definition[]>([])
  const [testModalOpen, setTestModalOpen] = useState(false)
  const [selectedTest, setSelectedTest] = useState<Definition | null>(null)
  const initializedRef = useRef(false)

  useEffect(() => {
    if (!initializedRef.current) {
      // Initialize storage on component mount
      storage.getDefinitions().then((data) => {
        setDefinitions(data)
      })
      initializedRef.current = true
    }
  }, [])

  const handleQuickRun = useCallback(
    async (testId: string) => {
      setRunningTests((prev) => [...prev, testId])

      try {
        // Create a new test run in localStorage
        const definition = testDefinitions.find((def) => def.id === testId)
        if (definition) {
          const newRun = await storage.createRun(definition.id)

          setTimeout(() => {
            setRunningTests((prev) => prev.filter((id) => id !== testId))

            toast({
              title: "Test started successfully",
              description: `Test "${newRun.name}" is now running.`,
            })
          }, 1500)
        }
      } catch (error) {
        setRunningTests((prev) => prev.filter((id) => id !== testId))

        toast({
          title: "Error starting test",
          description: error instanceof Error ? error.message : "Unknown error occurred",
          variant: "destructive",
        })
      }
    },
    [testDefinitions, toast]
  )

  const handleTestWithModal = useCallback((test: Definition) => {
    setSelectedTest(test)
    setTestModalOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setTestModalOpen(false)
    setSelectedTest(null)
  }, [])

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
