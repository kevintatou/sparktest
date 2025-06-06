"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { ArrowLeft, Plus, Play, Trash2, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { formatDistanceToNow } from "@/lib/utils"
import type { TestSuite } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function TestSuitesPage() {
  const { toast } = useToast()
  const [testSuites, setTestSuites] = useState<TestSuite[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [isRunning, setIsRunning] = useState<string | null>(null)
  const initializedRef = useRef(false)
  const [testModalOpen, setTestModalOpen] = useState(false)
  const [selectedSuite, setSelectedSuite] = useState<TestSuite | null>(null)

  // Mock test suites data
  useEffect(() => {
    if (!initializedRef.current) {
      const mockSuites: TestSuite[] = [
        {
          id: "api-suite",
          name: "API Test Suite",
          description: "Complete API testing including auth, CRUD operations, and error handling",
          testDefinitionIds: ["api-tests", "auth-tests", "error-handling-tests"],
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          executionMode: "sequential",
          labels: ["api", "backend"],
        },
        {
          id: "e2e-suite",
          name: "End-to-End Suite",
          description: "Full user journey testing across the application",
          testDefinitionIds: ["login-tests", "dashboard-tests", "checkout-tests"],
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          executionMode: "sequential",
          labels: ["e2e", "frontend"],
        },
        {
          id: "performance-suite",
          name: "Performance Test Suite",
          description: "Load testing and performance benchmarks",
          testDefinitionIds: ["load-tests", "stress-tests", "spike-tests"],
          createdAt: new Date(Date.now() - 259200000).toISOString(),
          executionMode: "parallel",
          labels: ["performance", "load"],
        },
      ]
      setTestSuites(mockSuites)
      initializedRef.current = true
    }
  }, [])

  const handleDelete = (id: string) => {
    setIsDeleting(id)

    setTimeout(() => {
      setTestSuites((prev) => prev.filter((suite) => suite.id !== id))
      setIsDeleting(null)

      toast({
        title: "Test suite deleted",
        description: "The test suite has been removed successfully.",
      })
    }, 500)
  }

  const handleRun = (suite: TestSuite) => {
    setSelectedSuite(suite)
    setTestModalOpen(true)
  }

  const handleRunSuite = async (suite: TestSuite) => {
    setIsRunning(suite.id)

    try {
      // Simulate running all tests in the suite
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "Test suite started",
        description: `Running ${suite.testDefinitionIds.length} tests in ${suite.executionMode} mode.`,
      })

      // Close modal
      setTestModalOpen(false)
      setSelectedSuite(null)
    } catch (error) {
      toast({
        title: "Error starting test suite",
        description: "Failed to start the test suite.",
        variant: "destructive",
      })
    } finally {
      setIsRunning(null)
    }
  }

  // Filter test suites based on search query
  const filteredSuites = testSuites.filter(
    (suite) =>
      suite.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      suite.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      suite.labels?.some((label) => label.toLowerCase().includes(searchQuery.toLowerCase())),
  )

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
            <h1 className="text-2xl font-bold">Test Suites</h1>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="relative w-full max-w-sm">
              <Input
                placeholder="Search suites..."
                className="pl-10"
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
            <Button asChild className="shadow-sm">
              <Link href="/suites/new">
                <Plus className="mr-2 h-4 w-4" />
                New Suite
              </Link>
            </Button>
          </div>

          {filteredSuites.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground mb-4">
                {searchQuery
                  ? "No test suites match your search query."
                  : "No test suites yet. Create your first test suite to group related tests."}
              </p>
              {!searchQuery && (
                <Button asChild>
                  <Link href="/suites/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Test Suite
                  </Link>
                </Button>
              )}
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredSuites.map((suite) => (
                <Card key={suite.id} className="flex flex-col transition-all hover:shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      {suite.name}
                    </CardTitle>
                    <CardDescription>{suite.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 text-sm text-muted-foreground">
                    <div className="space-y-3">
                      <div>
                        <p className="font-medium text-foreground">Tests: {suite.testDefinitionIds.length}</p>
                        <p>Mode: {suite.executionMode}</p>
                      </div>

                      {suite.labels && suite.labels.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {suite.labels.map((label) => (
                            <Badge key={label} variant="outline" className="text-xs">
                              {label}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <p className="text-xs">Created {formatDistanceToNow(suite.createdAt)}</p>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t pt-4">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/suites/edit/${suite.id}`}>Edit</Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20"
                        onClick={() => handleDelete(suite.id)}
                        disabled={isDeleting === suite.id}
                      >
                        {isDeleting === suite.id ? (
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
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <Button size="sm" onClick={() => handleRun(suite)} disabled={isRunning === suite.id}>
                      {isRunning === suite.id ? (
                        <>
                          <svg
                            className="mr-2 h-4 w-4 animate-spin"
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
                          Starting...
                        </>
                      ) : (
                        <>
                          <Play className="mr-2 h-4 w-4" />
                          Run Suite
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      {selectedSuite && (
        <Dialog open={testModalOpen} onOpenChange={setTestModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Run Test Suite</DialogTitle>
              <DialogDescription>Execute all tests in the "{selectedSuite.name}" suite</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Suite:</span>
                  <span className="text-sm text-muted-foreground">{selectedSuite.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Tests:</span>
                  <span className="text-sm text-muted-foreground">{selectedSuite.testDefinitionIds.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Execution:</span>
                  <Badge variant="outline">{selectedSuite.executionMode}</Badge>
                </div>
              </div>

              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  This will execute all {selectedSuite.testDefinitionIds.length} tests in {selectedSuite.executionMode}{" "}
                  mode.
                  {selectedSuite.executionMode === "sequential"
                    ? " Tests will run one after another."
                    : " Tests will run simultaneously."}
                </p>
              </div>
            </div>

            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={() => setTestModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => handleRunSuite(selectedSuite)}
                disabled={isRunning === selectedSuite.id}
                className="min-w-[100px]"
              >
                {isRunning === selectedSuite.id ? (
                  <>
                    <svg
                      className="mr-2 h-4 w-4 animate-spin"
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
                    Starting...
                  </>
                ) : (
                  "Run Suite"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
