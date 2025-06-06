export interface TestDefinition {
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

export interface Test {
  id: string
  name: string
  image: string
  command: string[]
  status: "running" | "completed" | "failed"
  createdAt: string
  testDefinitionId?: string
  executorId?: string
  suiteId?: string
  variables?: Record<string, string>
  artifacts?: string[]
  duration?: number
  retries?: number
  logs?: string[]
  k8sJobName?: string
}
