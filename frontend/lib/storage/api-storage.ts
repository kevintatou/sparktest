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
    const res = await fetch(`${API_BASE}/test-definitions`, {
      method: "POST",
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

  // Test Runs
  async getRuns(): Promise<Run[]> {
    const res = await fetch(`${API_BASE}/test-runs`)
    if (!res.ok) throw new Error("Failed to fetch runs")
    const data = await res.json()
    // Convert snake_case to camelCase, ensure createdAt is valid, filter and sort
    return data
      .map((run: any) => {
        const { created_at, ...rest } = run
        return {
          ...rest,
          createdAt: created_at ? new Date(created_at).toISOString() : "",
        }
      })
      .filter((run: any) => !!run.createdAt && !isNaN(new Date(run.createdAt).getTime()))
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
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
    try {
      const res = await fetch(`${API_BASE}/test-suites`)
      if (!res.ok) throw new Error("Failed to fetch test suites")
      
      const data = await res.json();
      
      // Convert snake_case to camelCase for each suite
      return data.map((suite: any) => ({
        id: suite.id,
        name: suite.name,
        description: suite.description || "",
        testDefinitionIds: suite.test_definition_ids || [],
        executionMode: suite.execution_mode as "sequential" | "parallel",
        createdAt: suite.created_at || new Date().toISOString(),
        labels: suite.labels || [],
      }));
    } catch (error) {
      console.error("Error fetching test suites from API:", error)
      // Fallback to empty array if the API endpoint doesn't exist yet
      return []
    }
  }

  async saveTestSuite(suite: TestSuite): Promise<TestSuite> {
    try {
      const method = suite.id ? "PUT" : "POST"
      const url = suite.id ? `${API_BASE}/test-suites/${suite.id}` : `${API_BASE}/test-suites`

      // Convert string IDs to UUIDs and camelCase to snake_case for backend compatibility
      const suitePayload: any = {
        ...suite,
        id: suite.id || "00000000-0000-0000-0000-000000000000", // Use nil UUID if no ID
        execution_mode: suite.executionMode,
        // Convert string IDs to UUIDs
        test_definition_ids: suite.testDefinitionIds.map(id => {
          // Check if ID is already a UUID
          if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
            return id;
          }
          // Generate a deterministic UUID from the string ID
          return `00000000-0000-0000-0000-${id.padStart(12, '0').substring(0, 12)}`;
        }),
        labels: suite.labels || [],
        description: suite.description || "",
        created_at: suite.createdAt || new Date().toISOString(),
      }
      delete suitePayload.executionMode
      delete suitePayload.testDefinitionIds
      delete suitePayload.createdAt

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(suitePayload),
      })

      if (!res.ok) throw new Error("Failed to save test suite")
      return await res.json()
    } catch (error) {
      console.error("Error saving test suite to API:", error)
      // Return the original suite if the API endpoint doesn't exist yet
      return suite
    }
  }

  async deleteTestSuite(id: string): Promise<boolean> {
    try {
      // Convert to UUID format if needed
      let uuidId = id;
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
        uuidId = `00000000-0000-0000-0000-${id.padStart(12, '0').substring(0, 12)}`;
      }
      
      const res = await fetch(`${API_BASE}/test-suites/${uuidId}`, { method: "DELETE" })
      return res.ok
    } catch (error) {
      console.error("Error deleting test suite from API:", error)
      // Return true to allow UI to proceed even if API endpoint doesn't exist yet
      return true
    }
  }

  async getTestSuiteById(id: string): Promise<TestSuite | undefined> {
    try {
      // Convert to UUID format if needed
      let uuidId = id;
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
        uuidId = `00000000-0000-0000-0000-${id.padStart(12, '0').substring(0, 12)}`;
      }
      
      const res = await fetch(`${API_BASE}/test-suites/${uuidId}`)
      if (!res.ok) throw new Error("Failed to fetch test suite")
      
      const data = await res.json();
      
      // Convert snake_case back to camelCase
      return {
        id: data.id,
        name: data.name,
        description: data.description || "",
        testDefinitionIds: data.test_definition_ids || [],
        executionMode: data.execution_mode as "sequential" | "parallel",
        createdAt: data.created_at || new Date().toISOString(),
        labels: data.labels || [],
      };
    } catch (error) {
      console.error("Error fetching test suite from API:", error)
      // Fallback to finding in the list if the API endpoint doesn't exist yet
      const list = await this.getTestSuites()
      return list.find((s) => s.id === id)
    }
  }

  initialize(): void {
    // No-op for API mode
  }
}
