"use client"

import { Loader2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface TestProgressProps {
  currentStep: string
  progress: number
}

export function TestProgress({ currentStep, progress }: TestProgressProps) {
  return (
    <div className="space-y-3 p-3 bg-muted/30 rounded-lg border">
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        <span className="text-sm font-medium">{currentStep}</span>
      </div>
      <Progress value={progress} className="h-2" />
      <p className="text-xs text-muted-foreground">{Math.round(progress)}% complete</p>
    </div>
  )
}