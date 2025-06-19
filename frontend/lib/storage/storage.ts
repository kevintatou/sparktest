import { Executor, Definition, Run } from "../types"

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
  initializeRun(
    definitionId: string,
    options?: { name?: string; image?: string; commands?: string[] }
  ): Promise<Run>

  // Optional: setup
  initialize(): void
}
