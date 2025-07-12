import type { StorageService } from "./storage"
import { getFromStorage, setToStorage } from "../utils"
import type { Executor, Definition, Run, Suite, KubernetesHealth, JobLogs, JobStatus, JobDeleteResponse } from "../types"
import { sampleExecutors, sampleDefinitions, sampleRuns, sampleSuites } from "../samples"

export class LocalStorageService implements StorageService {
  async getExecutors(): Promise<Executor[]> {
    return getFromStorage("sparktest_executors", sampleExecutors)
  }

  async saveExecutor(executor: Executor): Promise<Executor> {
    const list = await this.getExecutors()
    const index = list.findIndex((e) => e.id === executor.id)
    if (index >= 0) {
      list[index] = executor
    } else {
      list.push(executor)
    }
    setToStorage("sparktest_executors", list)
    return executor
  }

  async deleteExecutor(id: string): Promise<boolean> {
    const list = await this.getExecutors()
    const updated = list.filter((e) => e.id !== id)
    setToStorage("sparktest_executors", updated)
    return true
  }

  async getExecutorById(id: string): Promise<Executor | undefined> {
    const list = await this.getExecutors()
    return list.find((e) => e.id === id)
  }

  async getDefinitions(): Promise<Definition[]> {
    return getFromStorage("sparktest_definitions", sampleDefinitions)
  }

  async saveDefinition(definition: Definition): Promise<Definition> {
    const list = await this.getDefinitions()
    const index = list.findIndex((d) => d.id === definition.id)
    if (index >= 0) {
      list[index] = definition
    } else {
      list.push(definition)
    }
    setToStorage("sparktest_definitions", list)
    return definition
  }

  async deleteDefinition(id: string): Promise<boolean> {
    const list = await this.getDefinitions()
    const updated = list.filter((d) => d.id !== id)
    setToStorage("sparktest_definitions", updated)
    return true
  }

  async getDefinitionById(id: string): Promise<Definition | undefined> {
    const list = await this.getDefinitions()
    return list.find((d) => d.id === id)
  }

  async getRuns(): Promise<Run[]> {
    console.log(getFromStorage("sparktest_runs", sampleRuns))
    return getFromStorage("sparktest_runs", sampleRuns)
  }

  async saveRun(run: Run): Promise<Run> {
    const list = await this.getRuns()
    const index = list.findIndex((r) => r.id === run.id)
    if (index >= 0) {
      list[index] = run
    } else {
      list.unshift(run)
    }
    setToStorage("sparktest_runs", list.slice(0, 50))
    return run
  }

  async deleteRun(id: string): Promise<boolean> {
    const list = await this.getRuns()
    const updated = list.filter((r) => r.id !== id)
    setToStorage("sparktest_runs", updated)
    return true
  }

  async getRunById(id: string): Promise<Run | undefined> {
    const list = await this.getRuns()
    return list.find((r) => r.id === id)
  }

  async createRun(
    definitionId: string,
    options?: { name?: string; image?: string; commands?: string[] },
  ): Promise<Run> {
    const def = await this.getDefinitionById(definitionId)
    if (!def) throw new Error("Definition not found")

    const run: Run = {
      id: `test-${Date.now()}`,
      name: options?.name || `${def.name} Run`,
      image: options?.image || def.image,
      command: options?.commands || def.commands,
      status: "running",
      createdAt: new Date().toISOString(),
      definitionId: def.id,
      executorId: def.executorId,
      variables: def.variables || {},
      artifacts: [],
      logs: ["> Starting test..."],
    }

    return this.saveRun(run)
  }
  subscribeToRuns(callback: (payload: { eventType: string; new?: Run; old?: Run }) => void): () => void {
    let previousRuns: Run[] = []
  
    const interval = setInterval(async () => {
      try {
        const newRuns = await this.getRuns()
  
        // INSERT
        const inserted = newRuns.filter(r => !previousRuns.some(p => p.id === r.id))
        for (const run of inserted) {
          callback({ eventType: "INSERT", new: run })
        }
  
        // UPDATE
        for (const run of newRuns) {
          const prev = previousRuns.find(p => p.id === run.id)
          if (prev && JSON.stringify(prev) !== JSON.stringify(run)) {
            callback({ eventType: "UPDATE", new: run })
          }
        }
  
        // DELETE
        const deleted = previousRuns.filter(r => !newRuns.some(n => n.id === r.id))
        for (const run of deleted) {
          callback({ eventType: "DELETE", old: run })
        }
  
        previousRuns = newRuns
      } catch (err) {
        console.error("Polling error in subscribeToRuns:", err)
      }
    }, 10000)
  
    return () => clearInterval(interval)
  }
  

  // Suites
  async getSuites(): Promise<Suite[]> {
    return getFromStorage("sparktest_suites", sampleSuites)
  }

  async saveSuite(suite: Suite): Promise<Suite> {
    const list = await this.getSuites()
    const index = list.findIndex((s) => s.id === suite.id)
    if (index >= 0) {
      list[index] = suite
    } else {
      list.push(suite)
    }
    setToStorage("sparktest_suites", list)
    return suite
  }

  async deleteSuite(id: string): Promise<boolean> {
    const list = await this.getSuites()
    const updated = list.filter((s) => s.id !== id)
    setToStorage("sparktest_suites", updated)
    return true
  }

  async getSuiteById(id: string): Promise<Suite | undefined> {
    const list = await this.getSuites()
    return list.find((s) => s.id === id)
  }

  // Kubernetes Integration - Not supported in local storage mode
  async getKubernetesHealth(): Promise<KubernetesHealth> {
    throw new Error("Kubernetes integration not available in local storage mode")
  }

  async getTestRunLogs(runId: string): Promise<JobLogs> {
    throw new Error("Kubernetes integration not available in local storage mode")
  }

  async getJobLogs(jobName: string): Promise<JobLogs> {
    throw new Error("Kubernetes integration not available in local storage mode")
  }

  async getJobStatus(jobName: string): Promise<JobStatus> {
    throw new Error("Kubernetes integration not available in local storage mode")
  }

  async deleteJob(jobName: string): Promise<JobDeleteResponse> {
    throw new Error("Kubernetes integration not available in local storage mode")
  }

  initialize(): void {
    if (typeof window === "undefined") return
    if (!localStorage.getItem("sparktest_executors")) {
      setToStorage("sparktest_executors", sampleExecutors)
    }
    if (!localStorage.getItem("sparktest_definitions")) {
      setToStorage("sparktest_definitions", sampleDefinitions)
    }
    if (!localStorage.getItem("sparktest_runs")) {
      setToStorage("sparktest_runs", sampleRuns)
    }
    if (!localStorage.getItem("sparktest_suites")) {
      setToStorage("sparktest_suites", sampleSuites)
    }
  }
}
