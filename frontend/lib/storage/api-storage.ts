import type { Executor, Definition, Run } from "../types"
import { StorageService } from "./storage"

const API_BASE = "/api"

export class ApiStorageService implements StorageService {

  // Executors
  async getExecutors(): Promise<Executor[]> {
    const res = await fetch(`${API_BASE}/executors`)
    if (!res.ok) throw new Error("Failed to fetch executors")
    return await res.json()
  }

  async saveExecutor(executor: Executor): Promise<Executor> {
    const res = await fetch(`${API_BASE}/executors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(executor),
    })
    if (!res.ok) throw new Error("Failed to save executor")
    return await res.json()
  }

  async deleteExecutor(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/executors/${id}`, { method: "DELETE" })
    return res.ok
  }

  async getExecutorById(id: string): Promise<Executor | undefined> {
    const list = await this.getExecutors()
    return list.find((e) => e.id === id)
  }

  // Definitions
  async getDefinitions(): Promise<Definition[]> {
    const res = await fetch(`${API_BASE}/definitions`)
    if (!res.ok) throw new Error("Failed to fetch definitions")
    return await res.json()
  }

  async saveDefinition(def: Definition): Promise<Definition> {
    const res = await fetch(`${API_BASE}/definitions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(def),
    })
    if (!res.ok) throw new Error("Failed to save definition")
    return await res.json()
  }

  async deleteDefinition(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/definitions/${id}`, { method: "DELETE" })
    return res.ok
  }

  async getDefinitionById(id: string): Promise<Definition | undefined> {
    const list = await this.getDefinitions()
    return list.find((d) => d.id === id)
  }

  // Runs
  async getRuns(): Promise<Run[]> {
    const res = await fetch(`${API_BASE}/runs`)
    if (!res.ok) throw new Error("Failed to fetch runs")
    return await res.json()
  }

  async getRunById(id: string): Promise<Run | undefined> {
    const list = await this.getRuns()
    return list.find((r) => r.id === id)
  }

  async saveRun(run: Run){
    const res = await fetch(`${API_BASE}/runs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(run),
    })

    if (!res.ok) throw new Error("Failed to create run")
    return await res.json()
  }

  async deleteRun(): Promise<boolean> {
    throw new Error("deleteRun is not supported in API mode")
  }

  async initializeRun(): Promise<Run> {
    throw new Error("initializeRun is not supported in API mode")
  }

  initialize(): void {
    // no-op for API
  }
}
