// Configuration for API backend
const USE_RUST_API = true // Set to true when Rust API is ready
const RUST_API_BASE_URL = process.env.NEXT_PUBLIC_RUST_API_URL || "http://localhost:8080/api"

import { storageService } from "./storage-service"
import type { TestDefinition, Test } from "./types"

// Test connection function
export async function testConnection() {
  if (USE_RUST_API) {
    console.log("AWODAWIOd")
    try {
      const response = await fetch(`${RUST_API_BASE_URL}/health`)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      console.log("data:"+ data)
      return { success: true, message: "Connected to Rust API", backend: "rust-api", data }
    } catch (error) {
      return { success: false, message: `Rust API error: ${error}`, backend: "rust-api" }
    }
  } else {
    try {
      // Test localStorage
      if (typeof window !== "undefined") {
        const testKey = "__test_connection__"
        localStorage.setItem(testKey, "test")
        localStorage.removeItem(testKey)
      }
      return { success: true, message: "Using localStorage fallback", backend: "localStorage" }
    } catch (error) {
      return { success: false, message: `localStorage error: ${error}`, backend: "localStorage" }
    }
  }
}

// Helper function for Rust API calls
async function callRustAPI(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${RUST_API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    throw new Error(`Rust API call failed: ${response.statusText}`)
  }

  return response.json()
}

// Test Definitions
export async function fetchTestDefinitions(): Promise<TestDefinition[]> {
  if (USE_RUST_API) {
    try {
      return await callRustAPI("/test-definitions")
    } catch (error) {
      console.error("Rust API error, falling back to localStorage:", error)
      return storageService.getTestDefinitions()
    }
  }
  return storageService.getTestDefinitions()
}

export async function fetchTestDefinition(id: string): Promise<TestDefinition | undefined> {
  if (USE_RUST_API) {
    try {
      return await callRustAPI(`/test-definitions/${id}`)
    } catch (error) {
      console.error("Rust API error, falling back to localStorage:", error)
      return storageService.getTestDefinitionById(id)
    }
  }
  return storageService.getTestDefinitionById(id)
}

export async function createTestDefinition(testDefinition: Omit<TestDefinition, "createdAt">): Promise<TestDefinition> {
  const newTestDefinition: TestDefinition = {
    ...testDefinition,
    createdAt: new Date().toISOString(),
  }

  if (USE_RUST_API) {
    try {
      return await callRustAPI("/test-definitions", {
        method: "POST",
        body: JSON.stringify(newTestDefinition),
      })
    } catch (error) {
      console.error("Rust API error, falling back to localStorage:", error)
      return storageService.saveTestDefinition(newTestDefinition)
    }
  }
  return storageService.saveTestDefinition(newTestDefinition)
}

export async function updateTestDefinition(testDefinition: TestDefinition): Promise<TestDefinition> {
  if (USE_RUST_API) {
    try {
      return await callRustAPI(`/test-definitions/${testDefinition.id}`, {
        method: "PUT",
        body: JSON.stringify(testDefinition),
      })
    } catch (error) {
      console.error("Rust API error, falling back to localStorage:", error)
      return storageService.saveTestDefinition(testDefinition)
    }
  }
  return storageService.saveTestDefinition(testDefinition)
}

export async function deleteTestDefinition(id: string): Promise<boolean> {
  if (USE_RUST_API) {
    try {
      await callRustAPI(`/test-definitions/${id}`, {
        method: "DELETE",
      })
      return true
    } catch (error) {
      console.error("Rust API error, falling back to localStorage:", error)
      return storageService.deleteTestDefinition(id)
    }
  }
  return storageService.deleteTestDefinition(id)
}

// Test Runs
export async function fetchTestRuns(): Promise<Test[]> {
  if (USE_RUST_API) {
    try {
      return await callRustAPI("/test-runs")
    } catch (error) {
      console.error("Rust API error, falling back to localStorage:", error)
      return storageService.getTestRuns()
    }
  }
  return storageService.getTestRuns()
}

export async function fetchTestRun(id: string): Promise<Test | undefined> {
  if (USE_RUST_API) {
    try {
      return await callRustAPI(`/test-runs/${id}`)
    } catch (error) {
      console.error("Rust API error, falling back to localStorage:", error)
      return storageService.getTestRunById(id)
    }
  }
  return storageService.getTestRunById(id)
}

export async function createTestRun(
  testDefinitionId: string,
  options?: {
    name?: string
    image?: string
    commands?: string[]
  },
): Promise<Test> {
  if (USE_RUST_API) {
    try {
      return await callRustAPI("/test-runs", {
        method: "POST",
        body: JSON.stringify({ testDefinitionId, ...options }),
      })
    } catch (error) {
      console.error("Rust API error, falling back to localStorage:", error)
      return storageService.createTestRun(testDefinitionId, options)
    }
  }
  return storageService.createTestRun(testDefinitionId, options)
}

export async function updateTestRun(testRun: Test): Promise<Test> {
  if (USE_RUST_API) {
    try {
      return await callRustAPI(`/test-runs/${testRun.id}`, {
        method: "PUT",
        body: JSON.stringify(testRun),
      })
    } catch (error) {
      console.error("Rust API error, falling back to localStorage:", error)
      return storageService.saveTestRun(testRun)
    }
  }
  return storageService.saveTestRun(testRun)
}

export async function deleteTestRun(id: string): Promise<boolean> {
  if (USE_RUST_API) {
    try {
      await callRustAPI(`/test-runs/${id}`, {
        method: "DELETE",
      })
      return true
    } catch (error) {
      console.error("Rust API error, falling back to localStorage:", error)
      return storageService.deleteTestRun(id)
    }
  }
  return storageService.deleteTestRun(id)
}

// Initialize function
export async function initialize(): Promise<void> {
  if (USE_RUST_API) {
    try {
      const health = await callRustAPI("/health")
      console.log("✅ Rust API connected successfully", health)
    } catch (error) {
      console.error("Failed to connect to Rust API:", error)
      console.log("📦 Falling back to localStorage")
    }
  } else {
    console.log("📦 Using localStorage (Rust API disabled)")
  }

  storageService.initializeStorage()
}

// Real-time subscriptions (mock implementation for localStorage)
export function subscribeToTestRuns(callback: (payload: any) => void) {
  if (USE_RUST_API) {
    // In the future, this could be implemented with WebSockets from the Rust API
    console.warn("Real-time subscriptions not yet implemented for Rust API")
  } else {
    console.warn("Real-time subscriptions not available with localStorage")
  }

  // Return a dummy unsubscribe function to maintain the same interface
  return {
    unsubscribe: () => {},
    // Add any other methods that might be expected
    channel: () => ({ on: () => ({ subscribe: () => ({}) }) }),
  }
}

// Legacy API compatibility
export async function getKubernetesInfo(): Promise<any> {
  if (USE_RUST_API) {
    try {
      return await callRustAPI("/kubernetes/info")
    } catch (error) {
      console.error("Rust API error:", error)
    }
  }

  return {
    connected: true,
    version: "v1.28.2",
    nodes: 3,
    pods: 24,
    namespace: "sparktest",
  }
}

export async function getKubernetesLogs(testId: string): Promise<string[]> {
  if (USE_RUST_API) {
    try {
      const response = await callRustAPI(`/kubernetes/logs/${testId}`)
      return response.logs || []
    } catch (error) {
      console.error("Rust API error:", error)
    }
  }

  const testRun = await fetchTestRun(testId)
  return (
    testRun?.logs || [
      "> Starting test run...",
      `> Using test ID: ${testId}`,
      "> Installing dependencies...",
      "> Running tests...",
      "> Test completed successfully",
    ]
  )
}

export async function fetchWebhooks(): Promise<any[]> {
  if (USE_RUST_API) {
    try {
      return await callRustAPI("/webhooks")
    } catch (error) {
      console.error("Rust API error:", error)
    }
  }
  return []
}

export async function fetchTestSuites(): Promise<any[]> {
  if (USE_RUST_API) {
    try {
      return await callRustAPI("/test-suites")
    } catch (error) {
      console.error("Rust API error:", error)
    }
  }
  return []
}

// Add these exports for compatibility
export { deleteTestDefinition as removeTestDefinition }
export { deleteTestRun as removeTestRun }
