import type { Executor, Definition, Run, TestSuite } from "../types"
import { StorageService } from "./storage"

const API_BASE = "http://localhost:3001/api"

export class ApiStorageService implements StorageService {
  // Test Executors
  async getExecutors(): Promise<Executor[]> {
    const res = await fetch(`${API_BASE}/test-executors`)
    if (!res.ok) throw new Error("Failed to fetch executors")
    return await res.json()
  }

  async saveExecutor(executor: Executor): Promise<Executor> {
    const res = await fetch(`${API_BASE}/test-executors`, {
      method: "POST",
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

  // Test Definitions
  async getDefinitions(): Promise<Definition[]> {
    const res = await fetch(`${API_BASE}/test-definitions`)
    if (!res.ok) throw new Error("Failed to fetch definitions")
    return await res.json()
  }

  async saveDefinition(def: Definition): Promise<Definition> {
    // If the definition has an ID, it's an update
    if (def.id) {
      const res = await fetch(`${API_BASE}/test-definitions/${def.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(def),
      })
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Error updating definition:", errorText);
        throw new Error(`Failed to update definition: ${res.status} ${errorText}`);
      }
      return def;
    } else {
      // For new definitions, don't send an ID - let the backend generate it
      const { id, ...defWithoutId } = def as any;
      
      // Convert createdAt to backend format if needed
      const payload = {
        ...defWithoutId,
        // Ensure commands is an array of strings
        commands: Array.isArray(defWithoutId.commands) ? defWithoutId.commands : [],
      };
      
      const res = await fetch(`${API_BASE}/test-definitions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Error creating definition:", errorText);
        throw new Error(`Failed to create definition: ${res.status} ${errorText}`);
      }
      
      return await res.json();
    }
  }

  async deleteDefinition(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/test-definitions/${id}`, { method: "DELETE" })
    return res.ok
  }

  async getDefinitionById(id: string): Promise<Definition | undefined> {
    const list = await this.getDefinitions()
    return list.find((d) => d.id === id)
  }

  // Test Runs
  async getRuns(): Promise<Run[]> {
    const res = await fetch(`${API_BASE}/test-runs`)
    if (!res.ok) throw new Error("Failed to fetch runs")
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
        for (const run of newOnly) {
          callback({ eventType: "INSERT", new: run })
        }

        for (const run of newRuns) {
          const prev = previousRuns.find(p => p.id === run.id)
          if (prev && JSON.stringify(prev) !== JSON.stringify(run)) {
            callback({ eventType: "UPDATE", new: run })
          }
        }

        const deleted = previousRuns.filter(r => !newRuns.some(n => n.id === r.id))
        for (const run of deleted) {
          callback({ eventType: "DELETE", old: run })
        }

        previousRuns = newRuns
      } catch (err) {
        console.error("subscribeToRuns error:", err)
      }
    }, 5000)

    return () => clearInterval(interval)
  }

  async createRun(
    definitionId: string,
    options?: { name?: string; image?: string; commands?: string[] }
  ): Promise<Run> {
    const payload = {
      test_definition_id: definitionId,
      ...options,
    }
    const res = await fetch(`${API_BASE}/test-runs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error("Failed to create test run")
    return await res.json()
  }

  // Test Suites
  async getTestSuites(): Promise<TestSuite[]> {
    const res = await fetch(`${API_BASE}/test-suites`)
    if (!res.ok) throw new Error("Failed to fetch test suites")
    return await res.json()
  }

  async saveTestSuite(suite: TestSuite): Promise<TestSuite> {
    const res = await fetch(`${API_BASE}/test-suites`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(suite),
    })
    if (!res.ok) throw new Error("Failed to save test suite")
    return await res.json()
  }

  async deleteTestSuite(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/test-suites/${id}`, { method: "DELETE" })
    return res.ok
  }

  async getTestSuiteById(id: string): Promise<TestSuite | undefined> {
    try {
      const res = await fetch(`${API_BASE}/test-suites/${id}`)
      if (!res.ok) return undefined
      return await res.json()
    } catch (error) {
      console.error("Error fetching test suite:", error)
      return undefined
    }
  }

  initialize(): void {
    // No-op for API mode
  }
}
