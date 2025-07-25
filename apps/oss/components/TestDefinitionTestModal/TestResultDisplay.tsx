"use client"

import { CheckCircle, XCircle } from "lucide-react"
import { formatDistanceToNow } from "@sparktest/core/utils"
import type { TestResult } from "./useTestDefinitionTestModal"

interface TestResultDisplayProps {
  result: TestResult
}

export function TestResultDisplay({ result }: TestResultDisplayProps) {
  return (
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
  )
}