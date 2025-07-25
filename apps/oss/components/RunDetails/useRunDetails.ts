import { useState, useEffect, useMemo } from "react"
import { Run, Definition, Executor } from "@sparktest/core/types"
import { storage } from "@sparktest/storage-service"
import { useToast } from "@/components/ui/use-toast"

interface UseRunDetailsProps {
  run: Run
}

export function useRunDetails({ run }: UseRunDetailsProps) {
  const { toast } = useToast()
  const [definition, setDefinition] = useState<Definition | null>(null)
  const [executor, setExecutor] = useState<Executor | null>(null)
  const [loading, setLoading] = useState(true)

  // Memoize the safe run object to prevent unnecessary re-renders
  const activeRun = useMemo<Run>(() => {
    const safeCreatedAt =
      run?.createdAt && !Number.isNaN(Date.parse(run.createdAt))
        ? run.createdAt
        : new Date().toISOString()

    return {
      ...run,
      createdAt: safeCreatedAt,
      k8sJobName: run.k8sJobName || `test-run-${run.id}`, // Generate job name if not provided
    }
  }, [run])

  // Load related definition and executor
  useEffect(() => {
    const loadRelatedData = async () => {
      try {
        if (activeRun.definitionId) {
          const def = await storage.getDefinitionById(activeRun.definitionId)
          setDefinition(def || null)

          if (def?.executorId) {
            const exec = await storage.getExecutorById(def.executorId)
            setExecutor(exec || null)
          }
        }
      } catch (error) {
        console.error("Error loading related data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadRelatedData()
  }, [activeRun.definitionId])

  // Memoized utility functions
  const safeDate = useMemo(
    () => (d: string | undefined) => new Date(d && !Number.isNaN(Date.parse(d)) ? d : Date.now()),
    []
  )

  const formatDate = useMemo(
    () => (dateString: string) => {
      const date = new Date(dateString)
      return date.toLocaleString()
    },
    []
  )

  const copyToClipboard = useMemo(
    () => (text: string, label: string) => {
      navigator.clipboard.writeText(text)
      toast({
        title: "Copied to clipboard",
        description: `${label} copied to clipboard`,
      })
    },
    [toast]
  )

  return {
    activeRun,
    definition,
    executor,
    loading,
    safeDate,
    formatDate,
    copyToClipboard,
  }
}
