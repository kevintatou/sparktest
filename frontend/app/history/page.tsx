"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { ArrowLeft, CheckCircle, Clock, Filter, XCircle } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { getTestRuns, initializeStorage } from "@/lib/storage-service"
import { formatDate } from "@/lib/utils"
import type { Test, TestStatus } from "@/lib/types"

export default function TestHistoryPage() {
  const [tests, setTests] = useState<Test[]>([])
  const [filteredTests, setFilteredTests] = useState<Test[]>([])
  const [filter, setFilter] = useState<TestStatus | "all">("all")
  const [progressValues, setProgressValues] = useState<Record<string, number>>({})
  const initializedRef = useRef(false)

  // Load tests from localStorage
  useEffect(() => {
    if (!initializedRef.current) {
      initializeStorage()
      const allTests = getTestRuns()
      setTests(allTests)
      setFilteredTests(allTests)
      initializedRef.current = true

      // Initialize progress values for running tests
      const initialProgress: Record<string, number> = {}
      allTests
        .filter((test) => test.status === "running")
        .forEach((test) => {
          initialProgress[test.id] = Math.floor(Math.random() * 70) + 10 // Start between 10-80%
        })
      setProgressValues(initialProgress)
    }
  }, [])

  // Filter tests based on selected filter
  useEffect(() => {
    if (filter === "all") {
      setFilteredTests(tests)
    } else {
      setFilteredTests(tests.filter((test) => test.status === filter))
    }
  }, [filter, tests])

  // Update progress values for running tests
  useEffect(() => {
    const runningTests = tests.filter((test) => test.status === "running")
    if (runningTests.length === 0) return

    const progressInterval = setInterval(() => {
      setProgressValues((prev) => {
        const newValues = { ...prev }
        let updated = false

        runningTests.forEach((test) => {
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
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">⚡ SparkTest</span>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-6">
          <div className="flex items-center gap-2 mb-6">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">Test History</h1>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>
              All
            </Button>
            <Button
              variant={filter === "completed" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("completed")}
              className="flex items-center gap-1"
            >
              <CheckCircle className="h-3.5 w-3.5 text-green-500" />
              Completed
            </Button>
            <Button
              variant={filter === "running" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("running")}
              className="flex items-center gap-1"
            >
              <Clock className="h-3.5 w-3.5 text-blue-500" />
              Running
            </Button>
            <Button
              variant={filter === "failed" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("failed")}
              className="flex items-center gap-1"
            >
              <XCircle className="h-3.5 w-3.5 text-red-500" />
              Failed
            </Button>
          </div>

          {filteredTests.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground mb-4">No tests found with the selected filter.</p>
              <Button variant="outline" size="sm" onClick={() => setFilter("all")} className="flex items-center gap-1">
                <Filter className="h-4 w-4" />
                Clear Filters
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredTests.map((test) => (
                <Card key={test.id} className="overflow-hidden hover:shadow-md transition-all">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        {test.status === "completed" && <CheckCircle className="h-5 w-5 text-green-500" />}
                        {test.status === "failed" && <XCircle className="h-5 w-5 text-red-500" />}
                        {test.status === "running" && (
                          <div className="relative flex h-5 w-5 items-center justify-center">
                            <div className="absolute h-full w-full animate-ping rounded-full bg-blue-400 opacity-30"></div>
                            <Clock className="h-5 w-5 text-blue-500" />
                          </div>
                        )}
                        {test.name}
                        <Badge
                          variant={
                            test.status === "completed"
                              ? "success"
                              : test.status === "failed"
                                ? "destructive"
                                : "default"
                          }
                        >
                          {test.status}
                        </Badge>
                      </CardTitle>
                      <Button asChild size="sm">
                        <Link href={`/tests/${test.id}`}>View Details</Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        {test.image} • {formatDate(test.createdAt)}
                      </p>
                      <div className="flex flex-wrap gap-2">
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
