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
  source?: string
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
  // Kubernetes-specific fields
  podScheduled?: string
  containerCreated?: string
  containerStarted?: string
  completed?: string
  failed?: string
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

// Kubernetes types
export interface KubernetesHealth {
  kubernetes_connected: boolean
  timestamp: string
}

export interface JobLogs {
  job_name: string
  pod_name: string
  logs: string
  timestamp: string
  status: string
}

export interface JobStatus {
  job_name: string
  status: string
  timestamp: string
}

export interface JobDeleteResponse {
  message: string
  timestamp: string
}