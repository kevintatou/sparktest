import type { Executor, Definition, Run, Suite, KubernetesHealth, JobLogs, JobStatus, JobDeleteResponse } from "@sparktest/core"
import { StorageService } from "./storage"
import { ApiStorageService } from "./api-storage"
import { LocalStorageService } from "./local-storage"

export class HybridStorageService implements StorageService {
  private apiStorage: ApiStorageService
  private localStorage: LocalStorageService

  constructor() {
    this.apiStorage = new ApiStorageService()
    this.localStorage = new LocalStorageService()
  }

  private async tryApiWithFallback<T>(
    apiMethod: () => Promise<T>,
    fallbackMethod: () => Promise<T>
  ): Promise<T> {
    try {
      return await apiMethod()
    } catch (error) {
      console.warn("API call failed, falling back to local storage:", error)
      return await fallbackMethod()
    }
  }

  // Executors
  async getExecutors(): Promise<Executor[]> {
    return this.tryApiWithFallback(
      () => this.apiStorage.getExecutors(),
      () => this.localStorage.getExecutors()
    )
  }

  async saveExecutor(executor: Executor): Promise<Executor> {
    return this.tryApiWithFallback(
      () => this.apiStorage.saveExecutor(executor),
      () => this.localStorage.saveExecutor(executor)
    )
  }

  async deleteExecutor(id: string): Promise<boolean> {
    return this.tryApiWithFallback(
      () => this.apiStorage.deleteExecutor(id),
      () => this.localStorage.deleteExecutor(id)
    )
  }

  async getExecutorById(id: string): Promise<Executor | undefined> {
    return this.tryApiWithFallback(
      () => this.apiStorage.getExecutorById(id),
      () => this.localStorage.getExecutorById(id)
    )
  }

  // Definitions
  async getDefinitions(): Promise<Definition[]> {
    return this.tryApiWithFallback(
      () => this.apiStorage.getDefinitions(),
      () => this.localStorage.getDefinitions()
    )
  }

  async saveDefinition(definition: Definition): Promise<Definition> {
    return this.tryApiWithFallback(
      () => this.apiStorage.saveDefinition(definition),
      () => this.localStorage.saveDefinition(definition)
    )
  }

  async deleteDefinition(id: string): Promise<boolean> {
    return this.tryApiWithFallback(
      () => this.apiStorage.deleteDefinition(id),
      () => this.localStorage.deleteDefinition(id)
    )
  }

  async getDefinitionById(id: string): Promise<Definition | undefined> {
    return this.tryApiWithFallback(
      () => this.apiStorage.getDefinitionById(id),
      () => this.localStorage.getDefinitionById(id)
    )
  }

  // Runs
  async getRuns(): Promise<Run[]> {
    return this.tryApiWithFallback(
      () => this.apiStorage.getRuns(),
      () => this.localStorage.getRuns()
    )
  }

  async saveRun(run: Run): Promise<Run> {
    return this.tryApiWithFallback(
      () => this.apiStorage.saveRun(run),
      () => this.localStorage.saveRun(run)
    )
  }

  async deleteRun(id: string): Promise<boolean> {
    return this.tryApiWithFallback(
      () => this.apiStorage.deleteRun(id),
      () => this.localStorage.deleteRun(id)
    )
  }

  async getRunById(id: string): Promise<Run | undefined> {
    return this.tryApiWithFallback(
      () => this.apiStorage.getRunById(id),
      () => this.localStorage.getRunById(id)
    )
  }

  async createRun(
    definitionId: string,
    options?: { name?: string; image?: string; commands?: string[] }
  ): Promise<Run> {
    return this.tryApiWithFallback(
      () => this.apiStorage.createRun(definitionId, options),
      () => this.localStorage.createRun(definitionId, options)
    )
  }

  subscribeToRuns(
    callback: (payload: { eventType: string; new?: Run; old?: Run }) => void
  ): () => void {
    // Try API subscription first, fallback to local storage if it fails
    try {
      const unsub = this.apiStorage.subscribeToRuns(callback)
      if (typeof unsub === "function") return unsub
      // If API returns null/undefined, fallback
      return this.localStorage.subscribeToRuns(callback)
    } catch (error) {
      console.warn("API subscription failed, falling back to local storage:", error)
      try {
        const unsub = this.localStorage.subscribeToRuns(callback)
        if (typeof unsub === "function") return unsub
      } catch (err) {
        // Both failed, return a no-op
        return () => {}
      }
      // If local returns null/undefined
      return () => {}
    }
  }

  // Suites
  async getSuites(): Promise<Suite[]> {
    return this.tryApiWithFallback(
      () => this.apiStorage.getSuites(),
      () => this.localStorage.getSuites()
    )
  }

  async saveSuite(suite: Suite): Promise<Suite> {
    return this.tryApiWithFallback(
      () => this.apiStorage.saveSuite(suite),
      () => this.localStorage.saveSuite(suite)
    )
  }

  async deleteSuite(id: string): Promise<boolean> {
    return this.tryApiWithFallback(
      () => this.apiStorage.deleteSuite(id),
      () => this.localStorage.deleteSuite(id)
    )
  }

  async getSuiteById(id: string): Promise<Suite | undefined> {
    return this.tryApiWithFallback(
      () => this.apiStorage.getSuiteById(id),
      () => this.localStorage.getSuiteById(id)
    )
  }

  // Kubernetes methods
  async getKubernetesHealth(): Promise<KubernetesHealth> {
    return this.tryApiWithFallback(
      () => this.apiStorage.getKubernetesHealth(),
      () => this.localStorage.getKubernetesHealth()
    )
  }

  async getTestRunLogs(runId: string): Promise<JobLogs> {
    return this.tryApiWithFallback(
      () => this.apiStorage.getTestRunLogs(runId),
      () => this.localStorage.getTestRunLogs(runId)
    )
  }

  async getJobLogs(jobName: string): Promise<JobLogs> {
    return this.tryApiWithFallback(
      () => this.apiStorage.getJobLogs(jobName),
      () => this.localStorage.getJobLogs(jobName)
    )
  }

  async getJobStatus(jobName: string): Promise<JobStatus> {
    return this.tryApiWithFallback(
      () => this.apiStorage.getJobStatus(jobName),
      () => this.localStorage.getJobStatus(jobName)
    )
  }

  async deleteJob(jobName: string): Promise<JobDeleteResponse> {
    return this.tryApiWithFallback(
      () => this.apiStorage.deleteJob(jobName),
      () => this.localStorage.deleteJob(jobName)
    )
  }

  async initialize(): Promise<void> {
    // Initialize both storage services
    await this.apiStorage.initialize()
    await this.localStorage.initialize()
  }
}
