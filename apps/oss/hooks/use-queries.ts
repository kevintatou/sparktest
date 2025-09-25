"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/components/ui/use-toast"

const API_BASE = "/api"

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
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/test-runs`)
      if (!response.ok) throw new Error('Failed to fetch runs')
      return response.json()
    },
    refetchInterval: 2000, // Refetch every 2 seconds to get live updates
  })
}

export function useRun(id: string) {
  return useQuery({
    queryKey: queryKeys.run(id),
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/test-runs/${id}`)
      if (!response.ok) throw new Error('Failed to fetch run')
      return response.json()
    },
  })
}

// Definitions
export function useDefinitions() {
  return useQuery({
    queryKey: queryKeys.definitions,
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/test-definitions`)
      if (!response.ok) throw new Error('Failed to fetch definitions')
      return response.json()
    },
  })
}

export function useDefinition(id: string) {
  return useQuery({
    queryKey: queryKeys.definition(id),
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/test-definitions/${id}`)
      if (!response.ok) throw new Error('Failed to fetch definition')
      return response.json()
    },
    enabled: !!id,
  })
}

// Executors
export function useExecutors() {
  return useQuery({
    queryKey: queryKeys.executors,
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/test-executors`)
      if (!response.ok) throw new Error('Failed to fetch executors')
      return response.json()
    },
  })
}

export function useExecutor(id: string) {
  return useQuery({
    queryKey: queryKeys.executor(id),
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/test-executors/${id}`)
      if (!response.ok) throw new Error('Failed to fetch executor')
      return response.json()
    },
    enabled: !!id,
  })
}

// Suites
export function useSuites() {
  return useQuery({
    queryKey: queryKeys.suites,
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/test-suites`)
      if (!response.ok) throw new Error('Failed to fetch suites')
      return response.json()
    },
  })
}

export function useSuite(id: string) {
  return useQuery({
    queryKey: queryKeys.suite(id),
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/test-suites/${id}`)
      if (!response.ok) throw new Error('Failed to fetch suite')
      return response.json()
    },
    enabled: !!id,
  })
}

// Mutations
export function useCreateRun() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (definitionId: string) => {
      const response = await fetch(`${API_BASE}/test-runs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ definitionId })
      })
      if (!response.ok) throw new Error('Failed to create run')
      return response.json()
    },
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
    mutationFn: async (id: string) => {
      const response = await fetch(`${API_BASE}/test-runs/${id}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to delete run')
      return response.json()
    },
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

export function useCreateSuite() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (suite: any) => {
      const response = await fetch(`${API_BASE}/test-suites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(suite)
      })
      if (!response.ok) throw new Error('Failed to create suite')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.suites })
      toast({
        title: "Suite created",
        description: "The test suite has been created successfully.",
      })
    },
    onError: (error) => {
      toast({
        title: "Error creating suite",
        description: error instanceof Error ? error.message : "Failed to create the suite",
        variant: "destructive",
      })
    },
  })
}

export function useUpdateSuite() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async ({ id, suite }: { id: string, suite: any }) => {
      const response = await fetch(`${API_BASE}/test-suites/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(suite)
      })
      if (!response.ok) throw new Error('Failed to update suite')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.suites })
      toast({
        title: "Suite updated",
        description: "The test suite has been updated successfully.",
      })
    },
    onError: (error) => {
      toast({
        title: "Error updating suite",
        description: error instanceof Error ? error.message : "Failed to update the suite",
        variant: "destructive",
      })
    },
  })
}

export function useDeleteSuite() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${API_BASE}/test-suites/${id}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to delete suite')
      return response.json()
    },
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
    mutationFn: async (suiteId: string) => {
      const response = await fetch(`${API_BASE}/test-suites/${suiteId}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!response.ok) throw new Error('Failed to run suite')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.runs })
      toast({
        title: "Suite run started",
        description: "Your suite run has been started successfully.",
      })
    },
    onError: (error) => {
      toast({
        title: "Failed to start suite run",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      })
    },
  })
}

export function useCreateExecutor() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (executor: any) => {
      const response = await fetch(`${API_BASE}/test-executors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(executor)
      })
      if (!response.ok) throw new Error('Failed to create executor')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.executors })
      toast({
        title: "Executor created",
        description: "Your executor has been created successfully.",
      })
    },
    onError: (error) => {
      toast({
        title: "Failed to create executor",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      })
    },
  })
}

export function useUpdateExecutor() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (executor: any) => {
      const response = await fetch(`${API_BASE}/test-executors/${executor.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(executor)
      })
      if (!response.ok) throw new Error('Failed to update executor')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.executors })
      toast({
        title: "Executor updated",
        description: "Your executor has been updated successfully.",
      })
    },
    onError: (error) => {
      toast({
        title: "Failed to update executor",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      })
    },
  })
}

export function useDeleteExecutor() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${API_BASE}/test-executors/${id}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to delete executor')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.executors })
      toast({
        title: "Executor deleted",
        description: "The executor has been removed successfully.",
      })
    },
    onError: (error) => {
      toast({
        title: "Error deleting executor",
        description: error instanceof Error ? error.message : "Failed to delete the executor",
        variant: "destructive",
      })
    },
  })
}
