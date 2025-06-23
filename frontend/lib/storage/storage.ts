import { Executor, Definition, Run, Suite } from "../types"

export interface StorageService {
  // Executors
  getExecutors(): Promise<Executor[]>
  getExecutorById(id: string): Promise<Executor | undefined>
  saveExecutor(executor: Executor): Promise<Executor> // create or update (upsert)
  deleteExecutor(id: string): Promise<boolean>

  // Definitions
  getDefinitions(): Promise<Definition[]>
  getDefinitionById(id: string): Promise<Definition | undefined>
  saveDefinition(definition: Definition): Promise<Definition> // create or update
  deleteDefinition(id: string): Promise<boolean>

  // Runs
  getRuns(): Promise<Run[]>
  getRunById(id: string): Promise<Run | undefined>
  saveRun(run: Run): Promise<Run> // update only (typically no "create" without logic)
  deleteRun(id: string): Promise<boolean>
  subscribeToRuns(
    callback: (payload: { eventType: string; new?: Run; old?: Run }) => void
  ): () => void

  // Suites
  getSuites(): Promise<Suite[]>
  getSuiteById(id: string): Promise<Suite | undefined>
  saveSuite(suite: Suite): Promise<Suite> // create or update
  deleteSuite(id: string): Promise<boolean>

  // Optional: setup
  initialize(): void
}
