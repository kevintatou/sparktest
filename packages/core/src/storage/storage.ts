import type { Executor, Definition, Run, TestSuite } from "../types"

export interface StorageService {
  // Test Executors
  getExecutors(): Promise<Executor[]>
  saveExecutor(executor: Executor): Promise<Executor>
  deleteExecutor(id: string): Promise<boolean>
  getExecutorById(id: string): Promise<Executor | undefined>

  // Test Definitions
  getDefinitions(): Promise<Definition[]>
  saveDefinition(def: Definition): Promise<Definition>
  deleteDefinition(id: string): Promise<boolean>
  getDefinitionById(id: string): Promise<Definition | undefined>

  // Test Runs
  getRuns(): Promise<Run[]>
  saveRun(run: Run): Promise<Run>
  deleteRun(id: string): Promise<boolean>
  getRunById(id: string): Promise<Run | undefined>
  subscribeToRuns(callback: (payload: { eventType: string; new?: Run; old?: Run }) => void): () => void
  createRun(definitionId: string, options?: { name?: string; image?: string; commands?: string[] }): Promise<Run>

  // Test Suites
  getTestSuites(): Promise<TestSuite[]>
  saveTestSuite(suite: TestSuite): Promise<TestSuite>
  deleteTestSuite(id: string): Promise<boolean>
  getTestSuiteById(id: string): Promise<TestSuite | undefined>

  // Kubernetes Integration
  getKubernetesHealth?(): Promise<any>
  getTestRunLogs?(runId: string): Promise<any>
  getJobLogs?(jobName: string): Promise<any>
  getJobStatus?(jobName: string): Promise<any>
  deleteJob?(jobName: string): Promise<any>

  initialize(): void
}