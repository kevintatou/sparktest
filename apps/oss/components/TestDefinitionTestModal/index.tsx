"use client"

import { Loader2, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useTestDefinitionTestModal } from "./useTestDefinitionTestModal"
import { TestDefinitionInfo } from "./TestDefinitionInfo"
import { TestProgress } from "./TestProgress"
import { TestResultDisplay } from "./TestResultDisplay"
import { EmptyTestState } from "./EmptyTestState"
import type { TestDefinition } from "@sparktest/core/types"

interface TestDefinitionTestModalProps {
  isOpen: boolean
  onClose: () => void
  testDefinition: TestDefinition
}

export function TestDefinitionTestModal({
  isOpen,
  onClose,
  testDefinition,
}: TestDefinitionTestModalProps) {
  const { testing, result, progress, currentStep, runTest, resetTest } =
    useTestDefinitionTestModal()

  const handleClose = () => {
    resetTest()
    onClose()
  }

  const handleRunTest = () => {
    runTest(testDefinition)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Test: {testDefinition.name}
          </DialogTitle>
          <DialogDescription>
            Execute this test definition and view real-time results
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <TestDefinitionInfo testDefinition={testDefinition} />

          {testing && <TestProgress currentStep={currentStep} progress={progress} />}

          {result && <TestResultDisplay result={result} />}

          {!testing && !result && <EmptyTestState />}
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
          <Button onClick={handleRunTest} disabled={testing} className="min-w-[120px]">
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

// Re-export for backward compatibility
export default TestDefinitionTestModal
