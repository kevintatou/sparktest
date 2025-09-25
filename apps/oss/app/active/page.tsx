"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { ArrowLeft, Clock } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useRuns } from "@/hooks/use-queries"
import { formatDistanceToNow } from "@tatou/core"
import type { Run } from "@tatou/core/types"

export default function ActiveTestsPage() {
  const { data: allTests = [], isLoading } = useRuns()
  const [progressValues, setProgressValues] = useState<Record<string, number>>({})
  
  // Filter running tests
  const runningTests = allTests.filter((test: Run) => test.status === "running")

  // Initialize progress values for new running tests
  useEffect(() => {
    setProgressValues(prev => {
      const newValues = { ...prev }
      runningTests.forEach((test: Run) => {
        if (!newValues[test.id]) {
          newValues[test.id] = Math.floor(Math.random() * 30) + 10 // Start between 10-40%
        }
      })
      return newValues
    })
  }, [runningTests.length])

  // Update progress values for running tests
  useEffect(() => {
    if (runningTests.length === 0) return

    const progressInterval = setInterval(() => {
      setProgressValues((prev) => {
        const newValues = { ...prev }
        let updated = false

        runningTests.forEach((test: Run) => {
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
  }, [runningTests.length])

  return (
    <div className="flex min-h-screen flex-col bg-background">
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

          {isLoading ? (
            <Card className="p-8 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
                <p className="text-muted-foreground">Loading active tests...</p>
              </div>
            </Card>
          ) : runningTests.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground mb-4">No active tests at the moment.</p>
              <Button asChild>
                <Link href="/tests">Run a Test</Link>
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {runningTests.map((test: Run) => (
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
                          {test.command.map((cmd: string, i: number) => (
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
