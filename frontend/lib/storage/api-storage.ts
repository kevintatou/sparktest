import type { Executor, Definition, Run, Suite } from "../types"
import { StorageService } from "./storage"

const API_BASE = "http://localhost:3001/api"

export class ApiStorageService implements StorageService {
  // Executors
  async getExecutors(): Promise<Executor[]> {
    const res = await fetch(`${API_BASE}/test-executors`)
    if (!res.ok) throw new Error("Failed to fetch executors")
    return await res.json()
  }

  async saveExecutor(executor: Executor): Promise<Executor> {
    const method = executor.id ? "PATCH" : "POST"
    const url = executor.id
      ? `${API_BASE}/test-executors/${executor.id}`
      : `${API_BASE}/test-executors`

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(executor),
    })

    if (!res.ok) throw new Error("Failed to save executor")
    return await res.json()
  }

  async deleteExecutor(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/test-executors/${id}`, { method: "DELETE" })
    return res.ok
  }

  async getExecutorById(id: string): Promise<Executor | undefined> {
    const list = await this.getExecutors()
    return list.find((e) => e.id === id)
  }

  // Definitions
  async getDefinitions(): Promise<Definition[]> {
    const res = await fetch(`${API_BASE}/test-definitions`)
    if (!res.ok) throw new Error("Failed to fetch definitions")
    return await res.json()
  }

  async saveDefinition(def: Definition): Promise<Definition> {
    const method = def.id ? "PATCH" : "POST"
    const url = def.id
      ? `${API_BASE}/test-definitions/${def.id}`
      : `${API_BASE}/test-definitions`

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(def),
    })

    if (!res.ok) throw new Error("Failed to save definition")
    return await res.json()
  }

  async deleteDefinition(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/test-definitions/${id}`, { method: "DELETE" })
    return res.ok
  }

  async getDefinitionById(id: string): Promise<Definition | undefined> {
    const list = await this.getDefinitions()
    return list.find((d) => d.id === id)
  }

  // Runs
  async getRuns(): Promise<Run[]> {
    const res = await fetch(`${API_BASE}/test-runs`)
    if (!res.ok) throw new Error("Failed to fetch runs")
    return await res.json()
  }

  async saveRun(run: Run): Promise<Run> {
    const method = run.id ? "PATCH" : "POST"
    const url = run.id
      ? `${API_BASE}/test-runs/${run.id}`
      : `${API_BASE}/test-runs`

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(run),
    })

    if (!res.ok) throw new Error("Failed to save run")
    return await res.json()
  }

  async getRunById(id: string): Promise<Run | undefined> {
    const list = await this.getRuns()
    return list.find((r) => r.id === id)
  }

  async deleteRun(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/test-runs/${id}`, { method: "DELETE" })
    return res.ok
  }

  subscribeToRuns(callback: (payload: { eventType: string; new?: Run; old?: Run }) => void): () => void {
    let previousRuns: Run[] = []

    const interval = setInterval(async () => {
      try {
        const newRuns = await this.getRuns()

        const newOnly = newRuns.filter(r => !previousRuns.some(p => p.id === r.id))
        for (const run of newOnly) callback({ eventType: "INSERT", new: run })

        for (const run of newRuns) {
          const prev = previousRuns.find(p => p.id === run.id)
          if (prev && JSON.stringify(prev) !== JSON.stringify(run)) {
            callback({ eventType: "UPDATE", new: run })
          }
        }

        const deleted = previousRuns.filter(r => !newRuns.some(n => n.id === r.id))
        for (const run of deleted) callback({ eventType: "DELETE", old: run })

        previousRuns = newRuns
      } catch (err) {
        console.error("subscribeToRuns error:", err)
      }
    }, 5000)

    return () => clearInterval(interval)
  }

  // Suites
  async getSuites(): Promise<Suite[]> {
    const res = await fetch(`${API_BASE}/test-suites`)
    if (!res.ok) throw new Error("Failed to fetch suites")
    return await res.json()
  }

  async saveSuite(suite: Suite): Promise<Suite> {
    const method = suite.id ? "PATCH" : "POST"
    const url = suite.id
      ? `${API_BASE}/test-suites/${suite.id}`
      : `${API_BASE}/test-suites`

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(suite),
    })

    if (!res.ok) throw new Error("Failed to save suite")
    return await res.json()
  }

  async deleteSuite(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/test-suites/${id}`, { method: "DELETE" })
    return res.ok
  }

  async getSuiteById(id: string): Promise<Suite | undefined> {
    const res = await fetch(`${API_BASE}/test-suites/${id}`)
    if (!res.ok) return undefined
    return await res.json()
  }

  initialize(): void {
    // No-op for API mode
  }
}
