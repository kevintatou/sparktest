"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { ArrowLeft, Clock } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { storage } from "@sparktest/storage-service"
import { formatDistanceToNow } from "@sparktest/core"
import type { Run } from "@sparktest/core/types"

export default function ActiveTestsPage() {
  const [tests, setTests] = useState<Run[]>([])
  const [progressValues, setProgressValues] = useState<Record<string, number>>({})
  const initializedRef = useRef(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Load tests from localStorage
  useEffect(() => {
    const loadRunningTests = async () => {
      if (!initializedRef.current) {
        const allTests = await storage.getRuns()
        const runningTests = allTests.filter((test) => test.status === "running")
        setTests(runningTests)
        initializedRef.current = true

        // Initialize progress values for running tests
        const initialProgress: Record<string, number> = {}
        runningTests.forEach((test) => {
          initialProgress[test.id] = Math.floor(Math.random() * 30) + 10 // Start between 10-40%
        })
        setProgressValues(initialProgress)

        // Set up a refresh interval
        intervalRef.current = setInterval(async () => {
          const updatedTests = await storage.getRuns()
          const runningTestsUpdate = updatedTests.filter((test) => test.status === "running")
          setTests(runningTestsUpdate)
        }, 5000)
      }
    }
    
    loadRunningTests()

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  // Update progress values for running tests
  useEffect(() => {
    if (tests.length === 0) return

    const progressInterval = setInterval(() => {
      setProgressValues((prev) => {
        const newValues = { ...prev }
        let updated = false

        tests.forEach((test) => {
          const increment = Math.floor(Math.random() * 5) + 1
          const currentValue = prev[test.id] || 0

          if (currentValue < 100) {
            newValues[test.id] = Math.min(100, currentValue + increment)
            updated = true
          }
        })

        return updated ? newValues : prev
      })
    }, 1000)

    return () => clearInterval(progressInterval)
  }, [tests])

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background to-muted/30">
      <main className="flex-1">
        <div className="container py-6">
          <div className="flex items-center gap-2 mb-6">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">Active Tests</h1>
          </div>

          {tests.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground mb-4">No active tests at the moment.</p>
              <Button asChild>
                <Link href="/tests">Run a Test</Link>
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {tests.map((test) => (
                <Card key={test.id} className="overflow-hidden hover:shadow-md transition-all">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <div className="relative flex h-5 w-5 items-center justify-center">
                          <div className="absolute h-full w-full animate-ping rounded-full bg-blue-400 opacity-30"></div>
                          <Clock className="h-5 w-5 text-blue-500" />
                        </div>
                        {test.name}
                        <Badge>running</Badge>
                      </CardTitle>
                      <Button asChild size="sm">
                        <Link href={`/tests/${test.id}`}>View Details</Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {test.image} • Started {formatDistanceToNow(test.createdAt)}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {test.command.map((cmd, i) => (
                            <Badge key={i} variant="outline">
                              {cmd}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Progress</span>
                          <span>{progressValues[test.id] || 0}%</span>
                        </div>
                        <Progress value={progressValues[test.id] || 0} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
