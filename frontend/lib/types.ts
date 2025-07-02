export interface Definition {
  id: string
  name: string
  description: string
  image: string
  commands: string[]
  createdAt: string
  executorId?: string
  variables?: Record<string, string>
  labels?: string[]
}

export interface Run {
  id: string
  name: string
  image: string
  command: string[]
  status: "running" | "completed" | "failed"
  createdAt: string
  definitionId?: string
  executorId?: string
  suiteId?: string
  variables?: Record<string, string>
  artifacts?: string[]
  duration?: number
  retries?: number
  logs?: string[]
  k8sJobName?: string
}

export type Executor = {
  id: string
  name: string
  image: string
  description?: string
  command?: string[]
  supportedFileTypes?: string[]
  env?: Record<string, string>
  createdAt: string
}

export interface TestSuite {
  id: string
  name: string
  description: string
  testDefinitionIds: string[]
  createdAt: string
  executionMode: "sequential" | "parallel"
  labels?: string[]
}

// Type aliases for backward compatibility
export type TestDefinition = Definition
export type TestRun = Run
export type Test = Run
