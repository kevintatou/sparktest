import type { StorageService } from "./storage"
import { getFromStorage, setToStorage } from "./generic/utils"
import type {
  Executor,
  Definition,
  Run,
<<<<<<< HEAD
<<<<<<<< HEAD:packages/storage-service/local-storage.ts
  Suite,
========
  TestSuite,
>>>>>>>> main:packages/storage/local-storage.ts
=======
  Suite,
>>>>>>> main
  KubernetesHealth,
  JobLogs,
  JobStatus,
  JobDeleteResponse,
<<<<<<< HEAD
<<<<<<<< HEAD:packages/storage-service/local-storage.ts
} from "@tatou/core"
import { sampleExecutors, sampleDefinitions, sampleRuns, sampleSuites } from "@tatou/core"
========
} from "../core/src/types"
import {
  sampleExecutors,
  sampleDefinitions,
  sampleRuns,
  sampleTestSuites,
} from "../core/src/samples"
>>>>>>>> main:packages/storage/local-storage.ts
=======
} from "@tatou/core"
import { sampleExecutors, sampleDefinitions, sampleRuns, sampleSuites } from "@tatou/core"
>>>>>>> main

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
      logs: ["> Starting test...", "> Initializing container..."],
    }

    const savedRun = await this.saveRun(run)

    // Simulate test execution with automatic completion
    this.simulateTestExecution(savedRun)

    return savedRun
  }
<<<<<<< HEAD
<<<<<<<< HEAD:packages/storage-service/local-storage.ts
=======
>>>>>>> main

  private simulateTestExecution(run: Run): void {
    // Simulate realistic test execution timing (5-15 seconds)
    const executionDuration = Math.floor(Math.random() * 10000) + 5000 // 5-15 seconds
    const progressInterval = 1000 // Update logs every second

    let elapsed = 0

    const progressTimer = setInterval(async () => {
      elapsed += progressInterval

      // Add progress logs
      const currentRun = await this.getRunById(run.id)
      if (!currentRun || currentRun.status !== "running") {
        clearInterval(progressTimer)
        return
      }

      const logs = [...(currentRun.logs || [])]

      if (elapsed <= executionDuration * 0.3) {
        logs.push(`> Setting up test environment... (${Math.floor(elapsed / 1000)}s)`)
      } else if (elapsed <= executionDuration * 0.7) {
        logs.push(`> Executing test commands... (${Math.floor(elapsed / 1000)}s)`)
      } else if (elapsed < executionDuration) {
        logs.push(`> Finalizing test results... (${Math.floor(elapsed / 1000)}s)`)
      }

      const updatedRun = {
        ...currentRun,
        logs: logs.slice(-10), // Keep only last 10 log entries
      }

      await this.saveRun(updatedRun)

      if (elapsed >= executionDuration) {
        clearInterval(progressTimer)
        await this.completeTestRun(run.id, executionDuration)
      }
    }, progressInterval)
  }

  private async completeTestRun(runId: string, executionTimeMs: number): Promise<void> {
    const run = await this.getRunById(runId)
    if (!run || run.status !== "running") return

    // Simulate 90% success rate
    const isSuccess = Math.random() > 0.1
    const endTime = new Date().toISOString()
    const durationInSeconds = Math.floor(executionTimeMs / 1000)

    const finalLogs = [...(run.logs || [])]
    if (isSuccess) {
      finalLogs.push(`> Test completed successfully in ${durationInSeconds}s`)
      finalLogs.push("> All assertions passed")
    } else {
      finalLogs.push(`> Test failed after ${durationInSeconds}s`)
      finalLogs.push("> One or more assertions failed")
    }

    const completedRun: Run = {
      ...run,
      status: isSuccess ? "completed" : "failed",
      duration: durationInSeconds,
      completed: isSuccess ? endTime : undefined,
      failed: isSuccess ? undefined : endTime,
      logs: finalLogs,
    }

    await this.saveRun(completedRun)
  }
<<<<<<< HEAD
========
>>>>>>>> main:packages/storage/local-storage.ts
=======
>>>>>>> main
  subscribeToRuns(
    callback: (payload: { eventType: string; new?: Run; old?: Run }) => void
  ): () => void {
    let previousRuns: Run[] = []

    const interval = setInterval(async () => {
      try {
        const newRuns = await this.getRuns()

        // INSERT
        const inserted = newRuns.filter((r) => !previousRuns.some((p) => p.id === r.id))
        for (const run of inserted) {
          callback({ eventType: "INSERT", new: run })
        }

        // UPDATE
        for (const run of newRuns) {
          const prev = previousRuns.find((p) => p.id === run.id)
          if (prev && JSON.stringify(prev) !== JSON.stringify(run)) {
            callback({ eventType: "UPDATE", new: run })
          }
        }

        // DELETE
        const deleted = previousRuns.filter((r) => !newRuns.some((n) => n.id === r.id))
        for (const run of deleted) {
          callback({ eventType: "DELETE", old: run })
        }

        previousRuns = newRuns
      } catch (err) {
        console.error("Polling error in subscribeToRuns:", err)
      }
<<<<<<< HEAD
<<<<<<<< HEAD:packages/storage-service/local-storage.ts
    }, 2000) // Poll every 2 seconds for better real-time feedback
========
    }, 10000)
>>>>>>>> main:packages/storage/local-storage.ts
=======
    }, 2000) // Poll every 2 seconds for better real-time feedback
>>>>>>> main

    return () => clearInterval(interval)
  }

  // Suites
<<<<<<< HEAD
  async getSuites(): Promise<Suite[]> {
    return getFromStorage("sparktest_test_suites", sampleSuites)
  }

  async saveSuite(suite: Suite): Promise<Suite> {
    const list = await this.getSuites()
=======
  async getTestSuites(): Promise<Suite[]> {
    return getFromStorage("sparktest_test_suites", sampleSuites)
  }

  async saveTestSuite(suite: Suite): Promise<Suite> {
    const list = await this.getTestSuites()
>>>>>>> main
    const index = list.findIndex((s) => s.id === suite.id)
    if (index >= 0) {
      list[index] = suite
    } else {
      list.push(suite)
    }
    setToStorage("sparktest_test_suites", list)
    return suite
  }

<<<<<<< HEAD
  async deleteSuite(id: string): Promise<boolean> {
    const list = await this.getSuites()
=======
  async deleteTestSuite(id: string): Promise<boolean> {
    const list = await this.getTestSuites()
>>>>>>> main
    const updated = list.filter((s) => s.id !== id)
    setToStorage("sparktest_test_suites", updated)
    return true
  }

<<<<<<< HEAD
  async getSuiteById(id: string): Promise<Suite | undefined> {
    const list = await this.getSuites()
=======
  async getTestSuiteById(id: string): Promise<Suite | undefined> {
    const list = await this.getTestSuites()
>>>>>>> main
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

<<<<<<< HEAD
  initialize(): void {
=======
  async initialize(): Promise<void> {
>>>>>>> main
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
    if (!localStorage.getItem("sparktest_test_suites")) {
      setToStorage("sparktest_test_suites", sampleSuites)
    }
  }
}
