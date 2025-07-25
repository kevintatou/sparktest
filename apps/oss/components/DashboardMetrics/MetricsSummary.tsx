"use client"

import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Clock } from "lucide-react"

interface MetricsSummaryProps {
  completedRuns: number
  failedRuns: number
  runningRuns: number
}

export function MetricsSummary({ completedRuns, failedRuns, runningRuns }: MetricsSummaryProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      <Badge
        variant="outline"
        className="bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800 text-xs"
      >
        <CheckCircle className="w-3 h-3 mr-1" />
        {completedRuns} Completed
      </Badge>
      <Badge
        variant="outline"
        className="bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800 text-xs"
      >
        <XCircle className="w-3 h-3 mr-1" />
        {failedRuns} Failed
      </Badge>
      {runningRuns > 0 && (
        <Badge
          variant="outline"
          className="bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 text-xs"
        >
          <Clock className="w-3 h-3 mr-1" />
          {runningRuns} Running
        </Badge>
      )}
    </div>
  )
}