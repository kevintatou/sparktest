"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { CheckCircle, Clock, XCircle } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { storage } from "@sparktest/storage-service"
import { formatDistanceToNow } from "@sparktest/core"
import type { Run } from "@sparktest/core/types"

export function TestList() {
  const [tests, setTests] = useState<Run[]>([])
  const [progressValues, setProgressValues] = useState<Record<string, number>>({})
  const initializedRef = useRef(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Load tests from localStorage only once on mount
  useEffect(() => {
    if (!initializedRef.current) {
      // Initialize storage on component mount
      storage.getRuns().then((data) => {
        setTests(data)
      })
      initializedRef.current = true

      // Set up a refresh interval to check for updates
      intervalRef.current = setInterval(async () => {
        const updatedTests = await storage.getRuns()
        setTests((prev) => {
          // Only update if the tests have actually changed
          if (JSON.stringify(prev) !== JSON.stringify(updatedTests)) {
            return updatedTests
          }
          return prev
        })
      }, 5000)
    }

    // Clean up interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  // Simulate real-time updates for running tests
  useEffect(() => {
    const runningTests = tests.filter((test) => test.status === "running")
    if (runningTests.length === 0) return

    // Initialize progress values for running tests that don't have values yet
    setProgressValues((prev) => {
      const newValues = { ...prev }
      runningTests.forEach((test) => {
        if (!newValues[test.id]) {
          newValues[test.id] = Math.floor(Math.random() * 30) + 10 // Start between 10-40%
        }
      })
      return newValues
    })

    const progressInterval = setInterval(() => {
      setProgressValues((prev) => {
        let updated = false
        const newValues = { ...prev }

        runningTests.forEach((test) => {
          // Increment progress by a random amount
          const increment = Math.floor(Math.random() * 5) + 1
          const currentValue = prev[test.id] || 0

          if (currentValue < 100) {
            newValues[test.id] = Math.min(100, currentValue + increment)
            updated = true
          }

          // If progress reaches 100%, update test status
          if (newValues[test.id] === 100 && currentValue !== 100) {
            setTimeout(() => {
              // Update the test status in localStorage
              const newStatus = Math.random() > 0.2 ? "completed" : "failed"
              const updatedTest = {
                ...test,
                status: newStatus,
              }
              storage.saveRun(updatedTest)

              // Update the local state
              setTests((prevTests) => prevTests.map((t) => (t.id === test.id ? updatedTest : t)))
            }, 1000)
          }
        })

        // Only return new values if something changed
        return updated ? newValues : prev
      })
    }, 1000)

    return () => clearInterval(progressInterval)
  }, [tests]) // Only depend on tests, not progressValues

  return (
    <div className="space-y-4">
      {tests.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            No test runs yet. Create a test definition and run it to see results here.
          </p>
        </Card>
      ) : (
        tests.map((test) => (
          <Card key={test.id} className="overflow-hidden transition-all hover:shadow-md">
            <div className="flex flex-col sm:flex-row">
              <div className="flex flex-1 items-start gap-4 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  {test.status === "completed" && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                  {test.status === "failed" && <XCircle className="h-5 w-5 text-red-500" />}
                  {test.status === "running" && (
                    <div className="relative flex h-5 w-5 items-center justify-center">
                      <div className="absolute h-full w-full animate-ping rounded-full bg-blue-400 opacity-30"></div>
                      <Clock className="h-5 w-5 text-blue-500" />
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{test.name}</h3>
                    <Badge
                      variant={
                        test.status === "completed"
                          ? "success"
                          : test.status === "failed"
                            ? "destructive"
                            : "default"
                      }
                      className="animate-in fade-in"
                    >
                      {test.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {test.image} • {formatDistanceToNow(test.createdAt)}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {test.command.map((cmd, i) => (
                      <Badge key={i} variant="outline">
                        {cmd}
                      </Badge>
                    ))}
                  </div>

                  {test.status === "running" && (
                    <div className="mt-3 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Progress</span>
                        <span>{progressValues[test.id] || 0}%</span>
                      </div>
                      <Progress value={progressValues[test.id] || 0} className="h-2" />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-end border-t sm:border-l sm:border-t-0 p-4">
                <Button asChild className="shadow-sm">
                  <Link href={`/tests/${test.id}`}>View Details</Link>
                </Button>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  )
}
