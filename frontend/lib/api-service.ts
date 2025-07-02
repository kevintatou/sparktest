import { storage } from "@/lib/storage"
import type { Definition, Run } from "@/lib/types"

/**
 * API service that respects the USE_RUST_API configuration
 * This service acts as a wrapper around the storage abstraction
 */

export async function initialize(): Promise<void> {
  // Storage initialization is handled by the storage service itself
  // This function exists for backward compatibility
  return Promise.resolve()
}

export async function fetchTestDefinitions(): Promise<Definition[]> {
  return await storage.getDefinitions()
}

export async function fetchTestRuns(): Promise<Run[]> {
  return await storage.getRuns()
}

export async function createTestRun(testDefinitionId: string): Promise<Run> {
  return await storage.createRun(testDefinitionId)
}

export async function updateTestRun(id: string, updates: Partial<Run>): Promise<Run> {
  const runs = await storage.getRuns()
  const existingRun = runs.find(r => r.id === id)
  
  if (!existingRun) {
    throw new Error(`Test run with id ${id} not found`)
  }

  const updatedRun = { ...existingRun, ...updates }
  return await storage.saveRun(updatedRun)
}