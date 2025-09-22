/**
 * SparkTest-specific storage service implementation
 * This service uses the generic storage services but provides SparkTest-specific business logic
 */

import {
  GenericHybridStorageService,
  GenericLocalStorageService,
  GenericApiStorageService,
  storageUtils,
} from "./generic"
import { StorageService } from "./storage"
import type {
  Executor,
  Definition,
  Run,
  Suite,
  KubernetesHealth,
  JobLogs,
  JobStatus,
  JobDeleteResponse,
} from "@tatou/core"
import { sampleExecutors, sampleDefinitions, sampleRuns, sampleSuites } from "@tatou/core"

const API_BASE = "http://localhost:8080/api"

export class SparkTestStorageService implements StorageService {
  private executorStorage: GenericHybridStorageService<Executor>
  private definitionStorage: GenericHybridStorageService<Definition>
  private runStorage: GenericHybridStorageService<Run>
  private suiteStorage: GenericHybridStorageService<Suite>

  constructor() {
    // Initialize storage services for each entity type
    this.executorStorage = new GenericHybridStorageService<Executor>(
      new GenericApiStorageService(`/test-executors`, API_BASE, (item: Executor) => item.id),
      new GenericLocalStorageService("sparktest_executors", sampleExecutors, (item: Executor) => item.id, storageUtils),
    )

    this.definitionStorage = new GenericHybridStorageService<Definition>(
      new GenericApiStorageService(`/test-definitions`, API_BASE, (item: Definition) => item.id),
      new GenericLocalStorageService("sparktest_definitions", sampleDefinitions, (item: Definition) => item.id, storageUtils),
    )

    this.runStorage = new GenericHybridStorageService<Run>(
      new GenericApiStorageService(`/test-runs`, API_BASE, (item: Run) => item.id),
      new GenericLocalStorageService("sparktest_runs", sampleRuns, (item: Run) => item.id, storageUtils),
    )

    this.suiteStorage = new GenericHybridStorageService<Suite>(
      new GenericApiStorageService(`/test-suites`, API_BASE, (item: Suite) => item.id),
      new GenericLocalStorageService("sparktest_suites", sampleSuites, (item: Suite) => item.id, storageUtils),
    )
  }

  // Executors
  async getExecutors(): Promise<Executor[]> {
    return this.executorStorage.getItems()
  }

  async saveExecutor(executor: Executor): Promise<Executor> {
    return this.executorStorage.saveItem(executor)
  }

  async deleteExecutor(id: string): Promise<boolean> {
    return this.executorStorage.deleteItem(id)
  }

  async getExecutorById(id: string): Promise<Executor | undefined> {
    return this.executorStorage.getItemById(id)
  }

  // Definitions
  async getDefinitions(): Promise<Definition[]> {
    return this.definitionStorage.getItems()
  }

  async saveDefinition(definition: Definition): Promise<Definition> {
    return this.definitionStorage.saveItem(definition)
  }

  async deleteDefinition(id: string): Promise<boolean> {
    return this.definitionStorage.deleteItem(id)
  }

  async getDefinitionById(id: string): Promise<Definition | undefined> {
    return this.definitionStorage.getItemById(id)
  }

  // Runs
  async getRuns(): Promise<Run[]> {
    return this.runStorage.getItems()
  }

  async saveRun(run: Run): Promise<Run> {
    return this.runStorage.saveItem(run)
  }

  async deleteRun(id: string): Promise<boolean> {
    return this.runStorage.deleteItem(id)
  }

  async getRunById(id: string): Promise<Run | undefined> {
    return this.runStorage.getItemById(id)
  }

  async createRun(
    definitionId: string,
    options?: { name?: string; image?: string; commands?: string[] }
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
      logs: ["Starting test..."],
    }

    return this.saveRun(run)
  }

  subscribeToRuns(
    callback: (payload: { eventType: string; new?: Run; old?: Run }) => void
  ): () => void {
    // For now, return a no-op unsubscribe function
    // In a real implementation, this would set up WebSocket or other real-time updates
    return () => {}
  }

  // Suites
  async getSuites(): Promise<Suite[]> {
    return this.suiteStorage.getItems()
  }

  async saveSuite(suite: Suite): Promise<Suite> {
    return this.suiteStorage.saveItem(suite)
  }

  async deleteSuite(id: string): Promise<boolean> {
    return this.suiteStorage.deleteItem(id)
  }

  async getSuiteById(id: string): Promise<Suite | undefined> {
    return this.suiteStorage.getItemById(id)
  }

  // Kubernetes Integration
  async getKubernetesHealth(): Promise<KubernetesHealth> {
    try {
      const response = await fetch(`${API_BASE}/k8s/health`)
      if (!response.ok) throw new Error("Failed to check Kubernetes health")
      return await response.json()
    } catch {
      // Fallback to mock data if API is not available
      return {
        kubernetes_connected: false,
        timestamp: new Date().toISOString(),
      }
    }
  }

  async getTestRunLogs(runId: string): Promise<JobLogs> {
    try {
      const response = await fetch(`${API_BASE}/test-runs/${runId}/logs`)
      if (!response.ok) throw new Error(`Failed to fetch logs for test run ${runId}`)
      return await response.json()
    } catch {
      // Fallback to local storage data
      const run = await this.getRunById(runId)
      return {
        job_name: run?.k8sJobName || `test-run-${runId}`,
        pod_name: `pod-${runId}`,
        logs: Array.isArray(run?.logs) ? run.logs.join('\n') : "No logs available",
        timestamp: new Date().toISOString(),
        status: run?.status || "unknown",
      }
    }
  }

  async getJobLogs(jobName: string): Promise<JobLogs> {
    try {
      const response = await fetch(`${API_BASE}/k8s/jobs/${jobName}/logs`)
      if (!response.ok) throw new Error(`Failed to fetch logs for job ${jobName}`)
      return await response.json()
    } catch {
      return {
        job_name: jobName,
        pod_name: `pod-${jobName}`,
        logs: `No logs available for job ${jobName}`,
        timestamp: new Date().toISOString(),
        status: "unknown",
      }
    }
  }

  async getJobStatus(jobName: string): Promise<JobStatus> {
    try {
      const response = await fetch(`${API_BASE}/k8s/jobs/${jobName}/status`)
      if (!response.ok) throw new Error(`Failed to fetch status for job ${jobName}`)
      return await response.json()
    } catch {
      return {
        job_name: jobName,
        status: "unknown",
        timestamp: new Date().toISOString(),
      }
    }
  }

  async deleteJob(jobName: string): Promise<JobDeleteResponse> {
    try {
      const response = await fetch(`${API_BASE}/k8s/jobs/${jobName}`, { method: "DELETE" })
      if (!response.ok) throw new Error(`Failed to delete job ${jobName}`)
      return await response.json()
    } catch (error) {
      return {
        message: `Failed to delete job ${jobName}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
      }
    }
  }

  async initialize(): Promise<void> {
    // Initialize all storage services
    await Promise.all([
      this.executorStorage.initialize?.(),
      this.definitionStorage.initialize?.(),
      this.runStorage.initialize?.(),
      this.suiteStorage.initialize?.(),
    ].filter(Boolean))
  }
}
