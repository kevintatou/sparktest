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
<<<<<<< HEAD
<<<<<<<< HEAD:packages/storage-service/sparktest-storage.ts
=======
>>>>>>> main
} from "@tatou/core"
import { sampleExecutors, sampleDefinitions, sampleRuns, sampleSuites } from "@tatou/core"

const API_BASE = "http://localhost:8080/api"
<<<<<<< HEAD
========
} from "../types"
import { sampleExecutors, sampleDefinitions, sampleRuns, sampleSuites } from "../samples"

const API_BASE = "http://localhost:3001/api"
>>>>>>>> main:packages/core/src/storage/sparktest-storage.ts
=======
>>>>>>> main

export class SparkTestStorageService implements StorageService {
  private executorStorage: GenericHybridStorageService<Executor>
  private definitionStorage: GenericHybridStorageService<Definition>
  private runStorage: GenericHybridStorageService<Run>
<<<<<<< HEAD
<<<<<<<< HEAD:packages/storage-service/sparktest-storage.ts
  private suiteStorage: GenericHybridStorageService<Suite>
========
  private testSuiteStorage: GenericHybridStorageService<Suite>
>>>>>>>> main:packages/core/src/storage/sparktest-storage.ts
=======
  private suiteStorage: GenericHybridStorageService<Suite>
>>>>>>> main

  constructor() {
    // Initialize executor storage
    const executorLocalStorage = new GenericLocalStorageService<Executor>(
      "sparktest_executors",
      sampleExecutors,
      (executor) => executor.id,
      storageUtils
    )
    const executorApiStorage = new GenericApiStorageService<Executor>(
      "test-executors",
      API_BASE,
      (executor) => executor.id
    )
    this.executorStorage = new GenericHybridStorageService<Executor>(
      executorApiStorage,
      executorLocalStorage
    )

    // Initialize definition storage
    const definitionLocalStorage = new GenericLocalStorageService<Definition>(
      "sparktest_definitions",
      sampleDefinitions,
      (definition) => definition.id,
      storageUtils
    )
    const definitionApiStorage = new GenericApiStorageService<Definition>(
      "test-definitions",
      API_BASE,
      (definition) => definition.id
    )
    this.definitionStorage = new GenericHybridStorageService<Definition>(
      definitionApiStorage,
      definitionLocalStorage
    )

    // Initialize run storage with transformations
    const runLocalStorage = new GenericLocalStorageService<Run>(
      "sparktest_runs",
      sampleRuns,
      (run) => run.id,
      storageUtils,
      {
        insertMode: "unshift",
        maxItems: 50,
      }
    )
    const runApiStorage = new GenericApiStorageService<Run>(
      "test-runs",
      API_BASE,
      (run) => run.id,
      {
        transformRequest: (run: Run) => ({
          ...run,
          created_at: run.createdAt,
          definition_id: run.definitionId,
          executor_id: run.executorId,
          createdAt: undefined,
          definitionId: undefined,
          executorId: undefined,
        }),
        transformResponse: (data: any[]) => {
          return data
            .map((run: any) => {
              const { created_at, definition_id, executor_id, ...rest } = run
              let createdAt = ""
              if (created_at && !isNaN(new Date(created_at).getTime())) {
                createdAt = new Date(created_at).toISOString()
              }
              return {
                ...rest,
                createdAt,
                definitionId: definition_id,
                executorId: executor_id,
              }
            })
            .filter((run: any) => !!run.createdAt && !isNaN(new Date(run.createdAt).getTime()))
            .sort(
              (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )
        },
      }
    )
    this.runStorage = new GenericHybridStorageService<Run>(runApiStorage, runLocalStorage)

<<<<<<< HEAD
<<<<<<<< HEAD:packages/storage-service/sparktest-storage.ts
    // Initialize suite storage with transformations
    const suiteLocalStorage = new GenericLocalStorageService<Suite>(
========
    // Initialize test suite storage with transformations
    const testSuiteLocalStorage = new GenericLocalStorageService<Suite>(
>>>>>>>> main:packages/core/src/storage/sparktest-storage.ts
=======
    // Initialize suite storage with transformations
    const suiteLocalStorage = new GenericLocalStorageService<Suite>(
>>>>>>> main
      "sparktest_test_suites",
      sampleSuites,
      (suite) => suite.id,
      storageUtils
    )
<<<<<<< HEAD
<<<<<<<< HEAD:packages/storage-service/sparktest-storage.ts
    const suiteApiStorage = new GenericApiStorageService<Suite>(
========
    const testSuiteApiStorage = new GenericApiStorageService<Suite>(
>>>>>>>> main:packages/core/src/storage/sparktest-storage.ts
=======
    const suiteApiStorage = new GenericApiStorageService<Suite>(
>>>>>>> main
      "test-suites",
      API_BASE,
      (suite) => suite.id,
      {
        transformRequest: (suite: Suite) => ({
          ...suite,
          id: suite.id || "00000000-0000-0000-0000-000000000000",
          execution_mode: suite.executionMode,
          test_definition_ids: suite.testDefinitionIds.map((id: string) => {
            if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
              return id
            }
            return `00000000-0000-0000-0000-${id.padStart(12, "0").substring(0, 12)}`
          }),
          labels: suite.labels || [],
          description: suite.description || "",
          created_at: suite.createdAt || new Date().toISOString(),
          executionMode: undefined,
          testDefinitionIds: undefined,
          createdAt: undefined,
        }),
        transformResponse: (data: any[]) => {
          return data.map((suite: any) => ({
            id: suite.id,
            name: suite.name,
            description: suite.description || "",
            testDefinitionIds: suite.test_definition_ids || [],
            executionMode: suite.execution_mode as "sequential" | "parallel",
            createdAt: suite.created_at || new Date().toISOString(),
            labels: suite.labels || [],
          }))
        },
      }
    )
<<<<<<< HEAD
<<<<<<<< HEAD:packages/storage-service/sparktest-storage.ts
    this.suiteStorage = new GenericHybridStorageService<Suite>(suiteApiStorage, suiteLocalStorage)
========
    this.testSuiteStorage = new GenericHybridStorageService<Suite>(
      testSuiteApiStorage,
      testSuiteLocalStorage
    )
>>>>>>>> main:packages/core/src/storage/sparktest-storage.ts
=======
    this.suiteStorage = new GenericHybridStorageService<Suite>(suiteApiStorage, suiteLocalStorage)
>>>>>>> main
  }

  // Executor methods
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

  // Definition methods
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

  // Run methods
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
      artifacts: [],
      logs: ["> Starting test..."],
    }

    return this.saveRun(run)
  }

  subscribeToRuns(
    callback: (payload: { eventType: string; new?: Run; old?: Run }) => void
  ): () => void {
    return this.runStorage.subscribe((payload) => {
      callback({
        eventType: payload.eventType,
        new: payload.new,
        old: payload.old,
      })
    })
  }

<<<<<<< HEAD
<<<<<<<< HEAD:packages/storage-service/sparktest-storage.ts
  // Suite methods
  async getSuites(): Promise<Suite[]> {
    return this.suiteStorage.getItems()
  }

  async saveSuite(suite: Suite): Promise<Suite> {
    return this.suiteStorage.saveItem(suite)
========
  // Test Suite methods
  async getTestSuites(): Promise<Suite[]> {
    return this.testSuiteStorage.getItems()
  }

  async saveTestSuite(suite: Suite): Promise<Suite> {
    return this.testSuiteStorage.saveItem(suite)
>>>>>>>> main:packages/core/src/storage/sparktest-storage.ts
  }

  async deleteSuite(id: string): Promise<boolean> {
    return this.suiteStorage.deleteItem(id)
  }

<<<<<<<< HEAD:packages/storage-service/sparktest-storage.ts
  async getSuiteById(id: string): Promise<Suite | undefined> {
    return this.suiteStorage.getItemById(id)
========
  async getTestSuiteById(id: string): Promise<Suite | undefined> {
    return this.testSuiteStorage.getItemById(id)
>>>>>>>> main:packages/core/src/storage/sparktest-storage.ts
=======
  // Suite methods
  async getTestSuites(): Promise<Suite[]> {
    return this.suiteStorage.getItems()
  }

  async saveTestSuite(suite: Suite): Promise<Suite> {
    return this.suiteStorage.saveItem(suite)
  }

  async deleteTestSuite(id: string): Promise<boolean> {
    return this.suiteStorage.deleteItem(id)
  }

  async getTestSuiteById(id: string): Promise<Suite | undefined> {
    return this.suiteStorage.getItemById(id)
>>>>>>> main
  }

  // Kubernetes Integration - These methods are SparkTest-specific and would remain in the main service
  async getKubernetesHealth(): Promise<KubernetesHealth> {
    try {
      const res = await fetch(`${API_BASE}/k8s/health`)
      if (!res.ok) throw new Error("Failed to check Kubernetes health")
<<<<<<< HEAD
<<<<<<<< HEAD:packages/storage-service/sparktest-storage.ts
      return (await res.json()) as KubernetesHealth
========
      return await res.json()
>>>>>>>> main:packages/core/src/storage/sparktest-storage.ts
=======
      return (await res.json()) as KubernetesHealth
>>>>>>> main
    } catch (error) {
      throw new Error("Kubernetes integration not available")
    }
  }

  async getTestRunLogs(runId: string): Promise<JobLogs> {
    try {
      const res = await fetch(`${API_BASE}/test-runs/${runId}/logs`)
      if (!res.ok) throw new Error(`Failed to fetch logs for test run ${runId}`)
      return (await res.json()) as JobLogs
    } catch (error) {
      throw new Error("Kubernetes integration not available")
    }
  }

  async getJobLogs(jobName: string): Promise<JobLogs> {
    try {
      const res = await fetch(`${API_BASE}/k8s/jobs/${jobName}/logs`)
      if (!res.ok) throw new Error(`Failed to fetch logs for job ${jobName}`)
      return (await res.json()) as JobLogs
    } catch (error) {
      throw new Error("Kubernetes integration not available")
    }
  }

  async getJobStatus(jobName: string): Promise<JobStatus> {
    try {
      const res = await fetch(`${API_BASE}/k8s/jobs/${jobName}/status`)
      if (!res.ok) throw new Error(`Failed to fetch status for job ${jobName}`)
      return (await res.json()) as JobStatus
    } catch (error) {
      throw new Error("Kubernetes integration not available")
    }
  }

  async deleteJob(jobName: string): Promise<JobDeleteResponse> {
    try {
      const res = await fetch(`${API_BASE}/k8s/jobs/${jobName}`, { method: "DELETE" })
      if (!res.ok) throw new Error(`Failed to delete job ${jobName}`)
      return (await res.json()) as JobDeleteResponse
    } catch (error) {
      throw new Error("Kubernetes integration not available")
    }
  }

  async initialize(): Promise<void> {
    await this.executorStorage.initialize()
    await this.definitionStorage.initialize()
    await this.runStorage.initialize()
    await this.suiteStorage.initialize()
  }
}
