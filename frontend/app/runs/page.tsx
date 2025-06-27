"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Plus, Play, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { formatDistanceToNow } from "@/lib/utils"
import type { TestRun } from "@/lib/types"

const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case "failed":
      return <XCircle className="h-4 w-4 text-red-500" />
    case "running":
      return <Clock className="h-4 w-4 text-blue-500" />
    default:
      return <AlertCircle className="h-4 w-4 text-yellow-500" />
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
    case "failed":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
    case "running":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
    default:
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
  }
}

export default function TestRunsPage() {
  const { toast } = useToast()
  const [testRuns, setTestRuns] = useState<TestRun[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const initializedRef = useRef(false)

  // Mock test runs data
  useEffect(() => {
    if (!initializedRef.current) {
      const mockRuns: TestRun[] = [
        {
          id: "run-1",
          name: "API Authentication Tests",
          definitionId: "api-auth-def",
          status: "completed",
          startTime: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
          endTime: new Date(Date.now() - 240000).toISOString(), // 4 minutes ago
          duration: 60,
          logs: "All tests passed successfully",
        },
        {
          id: "run-2",
          name: "Load Testing Suite",
          definitionId: "load-test-def",
          status: "running",
          startTime: new Date(Date.now() - 120000).toISOString(), // 2 minutes ago
          duration: 0,
          logs: "Test in progress...",
        },
        {
          id: "run-3",
          name: "E2E User Journey",
          definitionId: "e2e-def",
          status: "failed",
          startTime: new Date(Date.now() - 600000).toISOString(), // 10 minutes ago
          endTime: new Date(Date.now() - 540000).toISOString(), // 9 minutes ago
          duration: 45,
          logs: "Test failed: Element not found",
        },
        {
          id: "run-4",
          name: "Database Migration Tests",
          definitionId: "db-migration-def",
          status: "completed",
          startTime: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
          endTime: new Date(Date.now() - 1740000).toISOString(), // 29 minutes ago
          duration: 120,
          logs: "Migration tests completed successfully",
        },
      ]
      setTestRuns(mockRuns)
      initializedRef.current = true
    }
  }, [])

  const handleDelete = (id: string) => {
    setIsDeleting(id)

    setTimeout(() => {
      setTestRuns((prev) => prev.filter((run) => run.id !== id))
      setIsDeleting(null)

      toast({
        title: "Test run deleted",
        description: "The test run has been removed successfully.",
      })
    }, 500)
  }

  // Filter test runs based on search query
  const filteredRuns = testRuns.filter(
    (run) =>
      run.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      run.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
      run.id.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Test Runs
          </h1>
          <p className="text-muted-foreground mt-1">Monitor and manage your test runs</p>
        </div>
        <Button
          asChild
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        >
          <Link href="/runs/new">
            <Plus className="mr-2 h-4 w-4" />
            New Run
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative w-full max-w-sm">
          <Input
            placeholder="Search runs..."
            className="pl-10 bg-slate-50 dark:bg-slate-800 border-0 focus-visible:ring-1"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {filteredRuns.length === 0 ? (
        <Card className="p-12 text-center bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 border-dashed">
          <div className="flex flex-col items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center">
              <Play className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery ? "No test runs match your search" : "No test runs yet"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery
                  ? "Try adjusting your search terms."
                  : "Start your first test run to see execution results here."}
              </p>
              {!searchQuery && (
                <Button
                  asChild
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  <Link href="/runs/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Start Test Run
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRuns.map((run) => (
            <Card
              key={run.id}
              className="group hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border-slate-200 dark:border-slate-700"
            >
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(run.status)}
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">{run.name}</h3>
                      <p className="text-sm text-muted-foreground">Run ID: {run.id}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(run.status)}>{run.status}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Started:</span>
                    <p className="font-medium">{formatDistanceToNow(run.startTime)} ago</p>
                  </div>
                  {run.endTime && (
                    <div>
                      <span className="text-muted-foreground">Ended:</span>
                      <p className="font-medium">{formatDistanceToNow(run.endTime)} ago</p>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Duration:</span>
                    <p className="font-medium">{run.status === "running" ? "Running..." : `${run.duration}s`}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Definition:</span>
                    <p className="font-medium">{run.definitionId}</p>
                  </div>
                </div>

                {run.logs && (
                  <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-3">
                    <p className="text-sm font-mono text-slate-700 dark:text-slate-300">{run.logs}</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-4 bg-slate-50/50 dark:bg-slate-800/50">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/runs/${run.id}`}>View Details</Link>
                  </Button>
                  {run.status !== "running" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200 dark:text-red-400 dark:hover:bg-red-950 dark:hover:text-red-300"
                      onClick={() => handleDelete(run.id)}
                      disabled={isDeleting === run.id}
                    >
                      {isDeleting === run.id ? (
                        <svg
                          className="h-4 w-4 animate-spin"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      ) : (
                        "Delete"
                      )}
                    </Button>
                  )}
                </div>
                {run.status === "failed" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:hover:bg-blue-900 dark:text-blue-300 dark:border-blue-800"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Retry
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
