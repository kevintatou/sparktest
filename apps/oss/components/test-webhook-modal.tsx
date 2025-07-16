"use client"

import { useState } from "react"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

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
import { formatDistanceToNow } from "@sparktest/core/utils"

interface TestResult {
  success: boolean
  message: string
  timestamp: string
  responseTime?: number
  statusCode?: number
}

interface TestWebhookModalProps {
  isOpen: boolean
  onClose: () => void
  webhook: {
    id: string
    name: string
    url: string
    type: string
  }
}

export function TestWebhookModal({ isOpen, onClose, webhook }: TestWebhookModalProps) {
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState<TestResult | null>(null)

  const runTest = async () => {
    setTesting(true)
    setResult(null)

    try {
      // Simulate API call
      const startTime = Date.now()
      await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000))
      const endTime = Date.now()

      // Mock result (85% success rate)
      const success = Math.random() > 0.15
      const statusCode = success ? 200 : Math.random() > 0.5 ? 404 : 500

      setResult({
        success,
        message: success
          ? "Webhook delivered successfully"
          : statusCode === 404
            ? "Webhook endpoint not found"
            : "Internal server error",
        timestamp: new Date().toISOString(),
        responseTime: endTime - startTime,
        statusCode,
      })
    } catch (error) {
      setResult({
        success: false,
        message: "Network error occurred",
        timestamp: new Date().toISOString(),
        responseTime: 0,
        statusCode: 0,
      })
    } finally {
      setTesting(false)
    }
  }

  const handleClose = () => {
    setResult(null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Test Webhook</DialogTitle>
          <DialogDescription>Send a test payload to verify your webhook configuration</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Webhook:</span>
              <span className="text-sm text-muted-foreground">{webhook.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">URL:</span>
              <span className="text-sm text-muted-foreground font-mono break-all">{webhook.url}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Type:</span>
              <Badge variant="outline">{webhook.type}</Badge>
            </div>
          </div>

          {testing && (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Sending test webhook...</p>
              </div>
            </div>
          )}

          {result && (
            <div
              className={`p-4 rounded-lg border ${
                result.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {result.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <span className={`font-medium ${result.success ? "text-green-700" : "text-red-700"}`}>
                  {result.success ? "Test Successful" : "Test Failed"}
                </span>
              </div>

              <div className="space-y-1 text-sm">
                <p className={result.success ? "text-green-600" : "text-red-600"}>{result.message}</p>
                {result.statusCode && result.statusCode > 0 && (
                  <p className="text-muted-foreground">Status Code: {result.statusCode}</p>
                )}
                {result.responseTime && <p className="text-muted-foreground">Response Time: {result.responseTime}ms</p>}
                <p className="text-muted-foreground">{formatDistanceToNow(result.timestamp)}</p>
              </div>
            </div>
          )}

          {!testing && !result && (
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">
                This will send a test payload to your webhook endpoint to verify it&apos;s working correctly.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
          <Button onClick={runTest} disabled={testing} className="min-w-[100px]">
            {testing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              "Run Test"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
