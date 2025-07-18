import { StorageService } from "./storage"
import { ApiStorageService } from "./api-storage"
import { LocalStorageService } from "./local-storage"
import type { Definition, Executor, Run, TestSuite } from "../types"

export class HybridStorageService implements StorageService {
  private apiStorage = new ApiStorageService()
  private localStorage = new LocalStorageService()

  initialize(): void {
    this.apiStorage.initialize()
    this.localStorage.initialize()
  }

  // Use API storage by default, fall back to local storage
  async getExecutors(): Promise<Executor[]> {
    try {
      return await this.apiStorage.getExecutors()
    } catch {
      return await this.localStorage.getExecutors()
    }
  }

  async saveExecutor(executor: Executor): Promise<Executor> {
    try {
      return await this.apiStorage.saveExecutor(executor)
    } catch {
      return await this.localStorage.saveExecutor(executor)
    }
  }

  async deleteExecutor(id: string): Promise<boolean> {
    try {
      return await this.apiStorage.deleteExecutor(id)
    } catch {
      return await this.localStorage.deleteExecutor(id)
    }
  }

  async getExecutorById(id: string): Promise<Executor | undefined> {
    try {
      return await this.apiStorage.getExecutorById(id)
    } catch {
      return await this.localStorage.getExecutorById(id)
    }
  }

  async getDefinitions(): Promise<Definition[]> {
    try {
      return await this.apiStorage.getDefinitions()
    } catch {
      return await this.localStorage.getDefinitions()
    }
  }

  async saveDefinition(def: Definition): Promise<Definition> {
    try {
      return await this.apiStorage.saveDefinition(def)
    } catch {
      return await this.localStorage.saveDefinition(def)
    }
  }

  async deleteDefinition(id: string): Promise<boolean> {
    try {
      return await this.apiStorage.deleteDefinition(id)
    } catch {
      return await this.localStorage.deleteDefinition(id)
    }
  }

  async getDefinitionById(id: string): Promise<Definition | undefined> {
    try {
      return await this.apiStorage.getDefinitionById(id)
    } catch {
      return await this.localStorage.getDefinitionById(id)
    }
  }

  async getRuns(): Promise<Run[]> {
    try {
      return await this.apiStorage.getRuns()
    } catch {
      return await this.localStorage.getRuns()
    }
  }

  async saveRun(run: Run): Promise<Run> {
    try {
      return await this.apiStorage.saveRun(run)
    } catch {
      return await this.localStorage.saveRun(run)
    }
  }

  async deleteRun(id: string): Promise<boolean> {
    try {
      return await this.apiStorage.deleteRun(id)
    } catch {
      return await this.localStorage.deleteRun(id)
    }
  }

  async getRunById(id: string): Promise<Run | undefined> {
    try {
      return await this.apiStorage.getRunById(id)
    } catch {
      return await this.localStorage.getRunById(id)
    }
  }

  subscribeToRuns(callback: (payload: { eventType: string; new?: Run; old?: Run }) => void): () => void {
    try {
      return this.apiStorage.subscribeToRuns(callback)
    } catch {
      return this.localStorage.subscribeToRuns(callback)
    }
  }

  async createRun(definitionId: string, options?: { name?: string; image?: string; commands?: string[] }): Promise<Run> {
    try {
      return await this.apiStorage.createRun(definitionId, options)
    } catch {
      return await this.localStorage.createRun(definitionId, options)
    }
  }

  async getTestSuites(): Promise<TestSuite[]> {
    try {
      return await this.apiStorage.getTestSuites()
    } catch {
      return await this.localStorage.getTestSuites()
    }
  }

  async saveTestSuite(suite: TestSuite): Promise<TestSuite> {
    try {
      return await this.apiStorage.saveTestSuite(suite)
    } catch {
      return await this.localStorage.saveTestSuite(suite)
    }
  }

  async deleteTestSuite(id: string): Promise<boolean> {
    try {
      return await this.apiStorage.deleteTestSuite(id)
    } catch {
      return await this.localStorage.deleteTestSuite(id)
    }
  }

  async getTestSuiteById(id: string): Promise<TestSuite | undefined> {
    try {
      return await this.apiStorage.getTestSuiteById(id)
    } catch {
      return await this.localStorage.getTestSuiteById(id)
    }
  }
}