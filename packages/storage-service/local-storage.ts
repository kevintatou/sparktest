import type { StorageService } from "./storage"
import { getFromStorage, setToStorage } from "./generic/utils"
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
    const filtered = list.filter((e) => e.id !== id)
    setToStorage("sparktest_executors", filtered)
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
    const filtered = list.filter((d) => d.id !== id)
    setToStorage("sparktest_definitions", filtered)
    return true
  }

  async getDefinitionById(id: string): Promise<Definition | undefined> {
    const list = await this.getDefinitions()
    return list.find((d) => d.id === id)
  }

  async getRuns(): Promise<Run[]> {
    return getFromStorage("sparktest_runs", sampleRuns)
  }

  async saveRun(run: Run): Promise<Run> {
    const list = await this.getRuns()
    const index = list.findIndex((r) => r.id === run.id)
    if (index >= 0) {
      list[index] = run
    } else {
      list.push(run)
    }
    setToStorage("sparktest_runs", list)
    return run
  }

  async deleteRun(id: string): Promise<boolean> {
    const list = await this.getRuns()
    const filtered = list.filter((r) => r.id !== id)
    setToStorage("sparktest_runs", filtered)
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
    if (!def) throw new Error(`Definition ${definitionId} not found`)

    const run: Run = {
      id: Date.now().toString(),
      name: options?.name || `Test run ${Date.now()}`,
      image: options?.image || def.image,
      command: options?.commands || def.commands,
      status: "running",
      createdAt: new Date().toISOString(),
      definitionId,
      executorId: def.executorId,
      variables: def.variables || {},
      logs: ["Starting test..."],
    }

    await this.saveRun(run)
    this.simulateTestExecution(run)
    return run
  }

  subscribeToRuns = (callback: (payload: { eventType: string; new?: Run; old?: Run }) => void) => {
    // In a real implementation, this would set up a subscription mechanism
    // For local storage, we'll just return a no-op unsubscribe function
    return () => {}
  }

  private simulateTestExecution(run: Run): void {
    // Simulate test execution for demo purposes
    const executionDuration = Math.floor(Math.random() * 10000) + 5000 // 5-15 seconds
    const progressInterval = 1000 // Update logs every second

    let elapsed = 0

    const progressTimer = setInterval(async () => {
      elapsed += progressInterval
      const progress = Math.min(elapsed / executionDuration, 1)

      // Update run status based on progress
      if (progress < 1) {
        run.status = "running"
        run.logs = (run.logs || []).concat(`[${new Date().toISOString()}] Executing... ${Math.round(progress * 100)}%`)
      } else {
        // Complete the run
        clearInterval(progressTimer)
        await this.completeTestRun(run.id, executionDuration)
      }

      await this.saveRun(run)
    }, progressInterval)
  }

  private async completeTestRun(runId: string, executionTimeMs: number): Promise<void> {
    const run = await this.getRunById(runId)
    if (!run) return

    // Randomly determine success/failure for demo
    const success = Math.random() > 0.3 // 70% success rate

    run.status = success ? "completed" : "failed"
    run.duration = Math.round(executionTimeMs / 1000) // Convert to seconds
    run.logs = (run.logs || []).concat(`[${new Date().toISOString()}] Test ${success ? "PASSED" : "FAILED"}`)

    await this.saveRun(run)
  }

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
    const filtered = list.filter((s) => s.id !== id)
    setToStorage("sparktest_suites", filtered)
    return true
  }

  async getSuiteById(id: string): Promise<Suite | undefined> {
    const list = await this.getSuites()
    return list.find((s) => s.id === id)
  }

  // Kubernetes Integration - Mock implementations for local storage
  async getKubernetesHealth(): Promise<KubernetesHealth> {
    return {
      kubernetes_connected: false,
      timestamp: new Date().toISOString(),
    }
  }

  async getTestRunLogs(runId: string): Promise<JobLogs> {
    const run = await this.getRunById(runId)
    return {
      job_name: run?.k8sJobName || `test-run-${runId}`,
      pod_name: `pod-${runId}`,
      logs: Array.isArray(run?.logs) ? run.logs.join('\n') : run?.logs || "No logs available",
      timestamp: new Date().toISOString(),
      status: run?.status || "unknown",
    }
  }

  async getJobLogs(jobName: string): Promise<JobLogs> {
    return {
      job_name: jobName,
      pod_name: `pod-${jobName}`,
      logs: `No logs available for job ${jobName} (Local Storage mode)`,
      timestamp: new Date().toISOString(),
      status: "unknown",
    }
  }

  async getJobStatus(jobName: string): Promise<JobStatus> {
    return {
      job_name: jobName,
      status: "Unknown",
      timestamp: new Date().toISOString(),
    }
  }

  async deleteJob(jobName: string): Promise<JobDeleteResponse> {
    return {
      message: `Local Storage mode - cannot delete job ${jobName} (no Kubernetes integration)`,
      timestamp: new Date().toISOString(),
    }
  }

  async initialize(): Promise<void> {
    // No initialization needed for local storage
  }
}
