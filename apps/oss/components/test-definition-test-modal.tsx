"use client"

import { useState } from "react"
import { CheckCircle, XCircle, Loader2, Play } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { formatDistanceToNow } from "@sparktest/core/utils"
import type { TestDefinition } from "@sparktest/core/types"

interface TestResult {
  success: boolean
  message: string
  timestamp: string
  duration?: number
  logs?: string[]
}

interface TestDefinitionTestModalProps {
  isOpen: boolean
  onClose: () => void
  testDefinition: TestDefinition
}

export function TestDefinitionTestModal({ isOpen, onClose, testDefinition }: TestDefinitionTestModalProps) {
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState<TestResult | null>(null)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState("")

  const runTest = async () => {
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
    } catch (error) {
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
  }

  const handleClose = () => {
    setResult(null)
    setProgress(0)
    setCurrentStep("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Test: {testDefinition.name}
          </DialogTitle>
          <DialogDescription>Execute this test definition and view real-time results</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Image:</span>
              <p className="text-muted-foreground font-mono">{testDefinition.image}</p>
            </div>
            <div>
              <span className="font-medium">Executor:</span>
              <Badge variant="outline">{testDefinition.executorId || "custom"}</Badge>
            </div>
          </div>

          <div>
            <span className="text-sm font-medium">Commands:</span>
            <div className="mt-1 space-y-1">
              {testDefinition.commands.map((cmd, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-xs">
                    {i + 1}
                  </Badge>
                  <code className="text-sm bg-muted px-2 py-1 rounded">{cmd}</code>
                </div>
              ))}
            </div>
          </div>

          {testing && (
            <div className="space-y-3 p-3 bg-muted/30 rounded-lg border">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm font-medium">{currentStep}</span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground">{Math.round(progress)}% complete</p>
            </div>
          )}

          {result && (
            <div
              className={`p-4 rounded-lg border ${
                result.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                {result.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <span className={`font-medium ${result.success ? "text-green-700" : "text-red-700"}`}>
                  {result.message}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                {result.duration && <p className="text-muted-foreground">Duration: {result.duration}s</p>}
                <p className="text-muted-foreground">Completed {formatDistanceToNow(result.timestamp)}</p>

                {result.logs && (
                  <div className="mt-3">
                    <p className="font-medium mb-2">Logs:</p>
                    <div className="bg-black text-green-400 p-3 rounded text-xs font-mono max-h-32 overflow-y-auto">
                      {result.logs.map((log, i) => (
                        <div key={i}>{log}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {!testing && !result && (
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">
                This will create a Kubernetes job to execute your test definition and show real-time progress.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
          <Button onClick={runTest} disabled={testing} className="min-w-[120px]">
            {testing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Run Test
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
