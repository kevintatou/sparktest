import { Executor, Definition, Run, Suite, KubernetesHealth, JobLogs, JobStatus, JobDeleteResponse } from "../types"

export interface StorageService {
  // Executors
  getExecutors(): Promise<Executor[]>
  saveExecutor(executor: Executor): Promise<Executor>
  deleteExecutor(id: string): Promise<boolean>
  getExecutorById(id: string): Promise<Executor | undefined>

  // Definitions
  getDefinitions(): Promise<Definition[]>
  saveDefinition(definition: Definition): Promise<Definition>
  deleteDefinition(id: string): Promise<boolean>
  getDefinitionById(id: string): Promise<Definition | undefined>

  // Runs
  getRuns(): Promise<Run[]>
  saveRun(run: Run): Promise<Run>
  deleteRun(id: string): Promise<boolean>
  getRunById(id: string): Promise<Run | undefined>
  createRun(
    definitionId: string,
    options?: { name?: string; image?: string; commands?: string[] }
  ): Promise<Run>
  subscribeToRuns: (
    callback: (payload: { eventType: string; new?: Run; old?: Run }) => void
  ) => () => void;

  // Suites
  getSuites(): Promise<Suite[]>
  saveSuite(suite: Suite): Promise<Suite>
  deleteSuite(id: string): Promise<boolean>
  getSuiteById(id: string): Promise<Suite | undefined>

  // Kubernetes Integration
  getKubernetesHealth(): Promise<KubernetesHealth>
  getTestRunLogs(runId: string): Promise<JobLogs>
  getJobLogs(jobName: string): Promise<JobLogs>
  getJobStatus(jobName: string): Promise<JobStatus>
  deleteJob(jobName: string): Promise<JobDeleteResponse>

  // Optional: setup
  initialize(): void
}
