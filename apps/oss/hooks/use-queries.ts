"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { storage } from "@sparktest/storage-service"
import { useToast } from "@/components/ui/use-toast"
import type { Run, Definition, Executor, Suite } from "@sparktest/core/types"

// Query keys
export const queryKeys = {
  runs: ["runs"] as const,
  definitions: ["definitions"] as const,
  executors: ["executors"] as const,
  suites: ["suites"] as const,
  run: (id: string) => ["run", id] as const,
  definition: (id: string) => ["definition", id] as const,
  executor: (id: string) => ["executor", id] as const,
  suite: (id: string) => ["suite", id] as const,
}

// Runs
export function useRuns() {
  return useQuery({
    queryKey: queryKeys.runs,
    queryFn: () => storage.getRuns(),
  })
}

export function useRun(id: string) {
  return useQuery({
    queryKey: queryKeys.run(id),
    queryFn: () => storage.getRunById(id),
    enabled: !!id,
  })
}

// Definitions
export function useDefinitions() {
  return useQuery({
    queryKey: queryKeys.definitions,
    queryFn: () => storage.getDefinitions(),
  })
}

export function useDefinition(id: string) {
  return useQuery({
    queryKey: queryKeys.definition(id),
    queryFn: () => storage.getDefinitionById(id),
    enabled: !!id,
  })
}

// Executors
export function useExecutors() {
  return useQuery({
    queryKey: queryKeys.executors,
    queryFn: () => storage.getExecutors(),
  })
}

export function useExecutor(id: string) {
  return useQuery({
    queryKey: queryKeys.executor(id),
    queryFn: () => storage.getExecutorById(id),
    enabled: !!id,
  })
}

// Suites
export function useSuites() {
  return useQuery({
    queryKey: queryKeys.suites,
    queryFn: () => storage.getSuites(),
  })
}

export function useSuite(id: string) {
  return useQuery({
    queryKey: queryKeys.suite(id),
    queryFn: () => storage.getSuiteById(id),
    enabled: !!id,
  })
}

// Mutations
export function useCreateRun() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (definitionId: string) => storage.createRun(definitionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.runs })
      toast({
        title: "Test run started",
        description: "Your test run has been started successfully.",
      })
    },
    onError: (error) => {
      toast({
        title: "Failed to start test run",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      })
    },
  })
}

export function useDeleteRun() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: string) => storage.deleteRun(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.runs })
      toast({
        title: "Run deleted",
        description: "The run has been removed successfully.",
      })
    },
    onError: (error) => {
      toast({
        title: "Error deleting run",
        description: error instanceof Error ? error.message : "Failed to delete the run",
        variant: "destructive",
      })
    },
  })
}

export function useDeleteSuite() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: string) => storage.deleteSuite(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.suites })
      toast({
        title: "Suite deleted",
        description: "The suite has been removed successfully.",
      })
    },
    onError: (error) => {
      toast({
        title: "Error deleting suite",
        description: error instanceof Error ? error.message : "Failed to delete the suite",
        variant: "destructive",
      })
    },
  })
}

export function useRunSuite() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (suite: Suite) => {
      // Get all test definitions in the suite
      const definitions = await Promise.all(
        suite.testDefinitionIds.map((id) => storage.getDefinitionById(id))
      )

      // Filter out any undefined definitions
      const validDefinitions = definitions.filter((def) => def !== undefined)

      if (validDefinitions.length === 0) {
        throw new Error("No valid test definitions found in suite")
      }

      // Create runs for each definition based on execution mode
      if (suite.executionMode === "sequential") {
        // Run tests one after another
        for (const def of validDefinitions) {
          if (def) {
            await storage.createRun(def.id)
          }
        }
      } else {
        // Run tests in parallel
        await Promise.all(validDefinitions.map((def) => def && storage.createRun(def.id)))
      }

      return validDefinitions.length
    },
    onSuccess: (count, suite) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.runs })
      toast({
        title: "Suite started",
        description: `Running ${count} tests in ${suite.executionMode} mode.`,
      })
    },
    onError: (error) => {
      toast({
        title: "Error starting suite",
        description:
          error instanceof Error
            ? error.message
            : "Failed to start the suite. Please check if all test definitions exist.",
        variant: "destructive",
      })
    },
  })
}
