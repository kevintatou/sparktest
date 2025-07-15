"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Plus, Play, Trash2, Layers } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { formatDistanceToNow } from "@sparktest/core/utils"
import type { TestSuite } from "@sparktest/core/types"
import { storage } from "@sparktest/core/storage"

export default function TestSuitesPage() {
  const { toast } = useToast()
  const [testSuites, setTestSuites] = useState<TestSuite[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [isRunning, setIsRunning] = useState<string | null>(null)
  const initializedRef = useRef(false)
  const [selectedSuite, setSelectedSuite] = useState<TestSuite | null>(null)

  // Load test suites from storage
  useEffect(() => {
    if (!initializedRef.current) {
      const fetchTestSuites = async () => {
        try {
          const suites = await storage.getTestSuites()
          setTestSuites(suites)
        } catch (error) {
          console.error("Error fetching test suites:", error)
          toast({
            title: "Error loading test suites",
            description: "Failed to load test suites. Please try again.",
            variant: "destructive",
          })
        } finally {
          initializedRef.current = true
        }
      }
      
      fetchTestSuites()
    }
  }, [])

  const handleDelete = async (id: string) => {
    setIsDeleting(id)

    try {
      const success = await storage.deleteTestSuite(id)
      
      if (success) {
        setTestSuites((prev) => prev.filter((suite) => suite.id !== id))
        
        toast({
          title: "Test suite deleted",
          description: "The test suite has been removed successfully.",
        })
      } else {
        throw new Error("Failed to delete test suite")
      }
    } catch (error) {
      console.error("Error deleting test suite:", error)
      toast({
        title: "Error deleting test suite",
        description: "Failed to delete the test suite. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(null)
    }
  }

  const handleRun = (suite: TestSuite) => {
    setSelectedSuite(suite)
  }

  const handleRunSuite = async (suite: TestSuite) => {
    setIsRunning(suite.id)

    try {
      // Get all test definitions in the suite
      const definitions = await Promise.all(
        suite.testDefinitionIds.map(id => storage.getDefinitionById(id))
      )
      
      // Filter out any undefined definitions
      const validDefinitions = definitions.filter(def => def !== undefined)
      
      if (validDefinitions.length === 0) {
        throw new Error("No valid test definitions found in suite")
      }
      
      // Create runs for each definition based on execution mode
      if (suite.executionMode === "sequential") {
        // Run tests one after another
        for (const def of validDefinitions) {
          if (def) {
            await storage.createRun(def.id)
          }
        }
      } else {
        // Run tests in parallel
        await Promise.all(
          validDefinitions.map(def => def && storage.createRun(def.id))
        )
      }

      toast({
        title: "Test suite started",
        description: `Running ${validDefinitions.length} tests in ${suite.executionMode} mode.`,
      })
    } catch (error) {
      console.error("Error running test suite:", error)
      toast({
        title: "Error starting test suite",
        description: "Failed to start the test suite. Please check if all test definitions exist.",
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
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Test Suites
          </h1>
          <p className="text-muted-foreground mt-1">Group related tests into logical test sets</p>
        </div>
        <Button
          asChild
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        >
          <Link href="/suites/new">
            <Plus className="mr-2 h-4 w-4" />
            New Suite
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative w-full max-w-sm">
          <Input
            placeholder="Search suites..."
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

      {filteredSuites.length === 0 ? (
        <Card className="p-12 text-center bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 border-dashed">
          <div className="flex flex-col items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center">
              <Layers className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery ? "No test suites match your search" : "No test suites yet"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery
                  ? "Try adjusting your search terms."
                  : "Create your first test suite to group related tests together."}
              </p>
              {!searchQuery && (
                <Button
                  asChild
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  <Link href="/suites/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Test Suite
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredSuites.map((suite) => (
            <Card
              key={suite.id}
              className="group hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border-slate-200 dark:border-slate-700"
            >
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white">
                    <Layers className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">{suite.name}</h3>
                    <p className="text-sm text-muted-foreground">{suite.testDefinitionIds.length} tests</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">{suite.description}</p>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Execution Mode:</span>
                    <Badge variant="outline" className="capitalize">
                      {suite.executionMode}
                    </Badge>
                  </div>

                  {suite.labels && suite.labels.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {suite.labels.map((label) => (
                        <Badge key={label} variant="secondary" className="text-xs">
                          {label}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground">Created {formatDistanceToNow(suite.createdAt)}</p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-4 bg-slate-50/50 dark:bg-slate-800/50">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/suites/edit/${suite.id}`}>Edit</Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200 dark:text-red-400 dark:hover:bg-red-950 dark:hover:text-red-300"
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
                <Button
                  size="sm"
                  onClick={() => handleRunSuite(suite)}
                  disabled={isRunning === suite.id}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
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
  )
}
