"use client"

import { useState } from "react"
import { CheckCircle, XCircle, Loader2, Code } from "lucide-react"

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
import type { Executor } from "@tatou/core"

interface ExecutorTestResult {
  success: boolean
  message: string
  timestamp: string
  pullTime?: number
  startTime?: number
  logs?: string[]
}

interface ExecutorTestModalProps {
  isOpen: boolean
  onClose: () => void
  executor: Executor
}

export function ExecutorTestModal({ isOpen, onClose, executor }: ExecutorTestModalProps) {
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState<ExecutorTestResult | null>(null)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState("")

  const runExecutorTest = async () => {
    setTesting(true)
    setResult(null)
    setProgress(0)

    try {
      const steps = [
        "Checking image availability...",
        "Pulling container image...",
        "Creating test container...",
        "Running executor test...",
        "Validating output...",
        "Cleaning up...",
      ]

      for (let i = 0; i < steps.length; i++) {
        setCurrentStep(steps[i])
        setProgress(((i + 1) / steps.length) * 100)
        await new Promise((resolve) => setTimeout(resolve, 600 + Math.random() * 1000))
      }

      // Simulate test result (90% success rate for executors)
      const success = Math.random() > 0.1
      const pullTime = Math.floor(Math.random() * 30) + 5 // 5-35 seconds
      const startTime = Math.floor(Math.random() * 5) + 1 // 1-6 seconds

      const logs = success
        ? [
            `> Testing executor: ${executor.name}`,
            `> Pulling image: ${executor.image}`,
            `> Image pulled successfully (${pullTime}s)`,
            `> Container started (${startTime}s)`,
            `> Running: ${executor.command?.join(" ") || "No command specified"}`,
            "",
            "✓ Executor is working correctly",
            "✓ All dependencies available",
            "✓ Command execution successful",
          ]
        : [
            `> Testing executor: ${executor.name}`,
            `> Pulling image: ${executor.image}`,
            `> Error: Image not found or inaccessible`,
            "",
            "✗ Executor test failed",
            "✗ Unable to pull container image",
            "Check image name and registry access",
          ]

      setResult({
        success,
        message: success ? "Executor is working correctly" : "Executor test failed",
        timestamp: new Date().toISOString(),
        pullTime: success ? pullTime : undefined,
        startTime: success ? startTime : undefined,
        logs,
      })
    } catch (error) {
      console.error("Test execution failed:", error)
      setResult({
        success: false,
        message: "Test execution failed",
        timestamp: new Date().toISOString(),
        logs: ["Error: Failed to test executor"],
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
            <Code className="h-5 w-5" />
            Test Executor: {executor.name}
          </DialogTitle>
          <DialogDescription>Verify that this test executor is working correctly</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Image:</span>
              <p className="text-muted-foreground font-mono">{executor.image}</p>
            </div>
            <div>
              <span className="font-medium">File Types:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {executor.supportedFileTypes?.map((type) => (
                  <Badge key={type} variant="outline" className="text-xs">
                    {type}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div>
            <span className="text-sm font-medium">Default Command:</span>
            <code className="block mt-1 text-sm bg-muted px-3 py-2 rounded">
              {executor.command?.join(" ") || "No command specified"}
            </code>
          </div>

          {testing && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">{currentStep}</span>
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
                <span
                  className={`font-medium ${result.success ? "text-green-700" : "text-red-700"}`}
                >
                  {result.message}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                {result.pullTime && (
                  <p className="text-muted-foreground">Image pull time: {result.pullTime}s</p>
                )}
                {result.startTime && (
                  <p className="text-muted-foreground">Container start time: {result.startTime}s</p>
                )}

                {result.logs && (
                  <div className="mt-3">
                    <p className="font-medium mb-2">Test Logs:</p>
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
                This will test if the executor image can be pulled and started successfully in your
                cluster.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
          <Button onClick={runExecutorTest} disabled={testing} className="min-w-[100px]">
            {testing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Code className="mr-2 h-4 w-4" />
                Test Executor
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
