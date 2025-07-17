import type { StorageService } from "./storage"
import { getFromStorage, setToStorage } from "./utils"
import type { Executor, Definition, Run, TestSuite, KubernetesHealth, JobLogs, JobStatus, JobDeleteResponse } from "@sparktest/core"
import { sampleExecutors, sampleDefinitions, sampleRuns, sampleTestSuites } from "./samples"

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
    const definition = await this.getDefinitionById(definitionId)
    if (!definition) {
      throw new Error(`Definition with ID ${definitionId} not found`)
    }

    const run: Run = {
      id: `run-${Date.now()}`,
      name: options?.name || definition.name,
      image: options?.image || definition.image,
      command: options?.commands || definition.commands,
      status: "running",
      createdAt: new Date().toISOString(),
      definitionId,
      executorId: definition.executorId,
      variables: definition.variables,
    }

    return this.saveRun(run)
  }

  subscribeToRuns = (
    callback: (payload: { eventType: string; new?: Run; old?: Run }) => void
  ) => {
    // Simple implementation - in a real app, this would be more sophisticated
    return () => {}
  }

  async getTestSuites(): Promise<TestSuite[]> {
    return getFromStorage("sparktest_test_suites", sampleTestSuites)
  }

  async saveTestSuite(suite: TestSuite): Promise<TestSuite> {
    const list = await this.getTestSuites()
    const index = list.findIndex((s) => s.id === suite.id)
    if (index >= 0) {
      list[index] = suite
    } else {
      list.push(suite)
    }
    setToStorage("sparktest_test_suites", list)
    return suite
  }

  async deleteTestSuite(id: string): Promise<boolean> {
    const list = await this.getTestSuites()
    const updated = list.filter((s) => s.id !== id)
    setToStorage("sparktest_test_suites", updated)
    return true
  }

  async getTestSuiteById(id: string): Promise<TestSuite | undefined> {
    const list = await this.getTestSuites()
    return list.find((s) => s.id === id)
  }

  async getKubernetesHealth(): Promise<KubernetesHealth> {
    return {
      kubernetes_connected: true,
      timestamp: new Date().toISOString(),
    }
  }

  async getTestRunLogs(runId: string): Promise<JobLogs> {
    const run = await this.getRunById(runId)
    return {
      job_name: run?.k8sJobName || `job-${runId}`,
      pod_name: `pod-${runId}`,
      logs: run?.logs?.join('\n') || 'No logs available',
      timestamp: new Date().toISOString(),
      status: run?.status || 'unknown',
    }
  }

  async getJobLogs(jobName: string): Promise<JobLogs> {
    return {
      job_name: jobName,
      pod_name: `pod-${jobName}`,
      logs: 'Sample log output',
      timestamp: new Date().toISOString(),
      status: 'completed',
    }
  }

  async getJobStatus(jobName: string): Promise<JobStatus> {
    return {
      job_name: jobName,
      status: 'completed',
      timestamp: new Date().toISOString(),
    }
  }

  async deleteJob(jobName: string): Promise<JobDeleteResponse> {
    return {
      message: `Job ${jobName} deleted successfully`,
      timestamp: new Date().toISOString(),
    }
  }

  initialize(): void {
    // Initialize any required setup
  }
}