"use client"

import { useState, useCallback } from "react"
import type { Definition } from "@tatou/core/types"

export interface TestResult {
  success: boolean
  message: string
  timestamp: string
  duration?: number
  logs?: string[]
}

export function useTestDefinitionTestModal() {
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState<TestResult | null>(null)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState("")

  const runTest = useCallback(async (testDefinition: Definition) => {
    setTesting(true)
    setResult(null)
    setProgress(0)
    setCurrentStep("Initializing...")

    try {
      const steps = [
        "Creating Kubernetes job...",
        "Pulling container image...",
        "Starting container...",
        "Running test commands...",
        "Collecting results...",
        "Cleaning up resources...",
      ]

      // Simulate test execution with progress
      for (let i = 0; i < steps.length; i++) {
        setCurrentStep(steps[i])
        setProgress((i / steps.length) * 100)
        await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 1200))
      }

      setProgress(100)
      setCurrentStep("Completed")

      // Simulate test result (80% success rate)
      const success = Math.random() > 0.2
      const duration = Math.floor(Math.random() * 120) + 30 // 30-150 seconds

      const logs = success
        ? [
            `> Starting test: ${testDefinition.name}`,
            `> Using image: ${testDefinition.image}`,
            ...testDefinition.commands.map((cmd) => `> ${cmd}`),
            "",
            "✓ All tests passed",
            "✓ No errors found",
            "",
            `Test completed in ${duration}s`,
          ]
        : [
            `> Starting test: ${testDefinition.name}`,
            `> Using image: ${testDefinition.image}`,
            ...testDefinition.commands.map((cmd) => `> ${cmd}`),
            "",
            "✗ Test failed",
            "Error: Connection timeout",
            "✗ 2 tests failed, 3 passed",
            "",
            `Test failed after ${duration}s`,
          ]

      setResult({
        success,
        message: success ? "Test completed successfully" : "Test failed with errors",
        timestamp: new Date().toISOString(),
        duration,
        logs,
      })
    } catch {
      setResult({
        success: false,
        message: "Test execution failed",
        timestamp: new Date().toISOString(),
        duration: 0,
        logs: ["Error: Failed to execute test"],
      })
    } finally {
      setTesting(false)
    }
  }, [])

  const resetTest = useCallback(() => {
    setResult(null)
    setProgress(0)
    setCurrentStep("")
  }, [])

  return {
    // State
    testing,
    result,
    progress,
    currentStep,

    // Actions
    runTest,
    resetTest,
  }
}
