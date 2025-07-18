import { StorageService } from "./storage"
import type { Definition, Executor, Run, TestSuite } from "../types"

export class LocalStorageService implements StorageService {
  initialize(): void {
    // No-op for local storage
  }

  // Executor methods
  async getExecutors(): Promise<Executor[]> {
    return []
  }

  async saveExecutor(executor: Executor): Promise<Executor> {
    return executor
  }

  async deleteExecutor(id: string): Promise<boolean> {
    return true
  }

  async getExecutorById(id: string): Promise<Executor | undefined> {
    return undefined
  }

  // Definition methods  
  async getDefinitions(): Promise<Definition[]> {
    return []
  }

  async saveDefinition(def: Definition): Promise<Definition> {
    return def
  }

  async deleteDefinition(id: string): Promise<boolean> {
    return true
  }

  async getDefinitionById(id: string): Promise<Definition | undefined> {
    return undefined
  }

  // Run methods
  async getRuns(): Promise<Run[]> {
    return []
  }

  async saveRun(run: Run): Promise<Run> {
    return run
  }

  async deleteRun(id: string): Promise<boolean> {
    return true
  }

  async getRunById(id: string): Promise<Run | undefined> {
    return undefined
  }

  subscribeToRuns(callback: (payload: { eventType: string; new?: Run; old?: Run }) => void): () => void {
    return () => {}
  }

  async createRun(definitionId: string, options?: { name?: string; image?: string; commands?: string[] }): Promise<Run> {
    return {} as Run
  }

  // Suite methods
  async getTestSuites(): Promise<TestSuite[]> {
    return []
  }

  async saveTestSuite(suite: TestSuite): Promise<TestSuite> {
    return suite
  }

  async deleteTestSuite(id: string): Promise<boolean> {
    return true
  }

  async getTestSuiteById(id: string): Promise<TestSuite | undefined> {
    return undefined
  }
}