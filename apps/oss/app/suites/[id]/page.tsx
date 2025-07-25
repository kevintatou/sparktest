"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Play, Edit, Clock, Users, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { formatDistanceToNow } from "@tatou/core"
import { storage } from "@tatou/storage-service"
import type { Definition, Suite } from "@tatou/core/types"

export default function SuiteDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { toast } = useToast()
  const [suite, setSuite] = useState<Suite | null>(null)
  const [definitions, setDefinitions] = useState<Definition[]>([])
  const [isRunning, setIsRunning] = useState(false)

  useEffect(() => {
    const loadSuiteAndDefinitions = async () => {
      try {
        // Load the suite from storage
        const loadedSuite = await storage.getSuiteById(id)
        if (!loadedSuite) {
          toast({
            title: "Suite not found",
            description: `Could not find suite with ID: ${id}`,
            variant: "destructive",
          })
          return
        }

        setSuite(loadedSuite)

        // Load the definitions for this suite
        const allDefs = await storage.getDefinitions()
        const suiteDefinitions = allDefs.filter((def) =>
          loadedSuite.testDefinitionIds.includes(def.id)
        )
        setDefinitions(suiteDefinitions)
      } catch (error) {
        console.error("Error loading suite details:", error)
        toast({
          title: "Error loading suite",
          description: "Failed to load suite details. Please try again.",
          variant: "destructive",
        })
      }
    }

    loadSuiteAndDefinitions()
  }, [id, toast])

  const handleRunSuite = async () => {
    if (!suite) return

    setIsRunning(true)
    try {
      // Get all test definitions in the suite
      const validDefinitions = definitions.filter((def) => def !== undefined)

      if (validDefinitions.length === 0) {
        throw new Error("No valid test definitions found in suite")
      }

      // Create runs for each definition based on execution mode
      if (suite.executionMode === "sequential") {
        // Run tests one after another
        for (const def of validDefinitions) {
          await storage.createRun(def.id)
        }
      } else {
        // Run tests in parallel
        await Promise.all(validDefinitions.map((def) => storage.createRun(def.id)))
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
      setIsRunning(false)
    }
  }

  if (!suite) {
    return (
      <div className="container py-6">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Suite not found.</p>
          <Link href="/suites" className="mt-4 text-blue-600 hover:underline">
            ← Back to Suites
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/suites">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {suite.name}
          </h1>
          <p className="text-muted-foreground mt-1">{suite.description}</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleRunSuite}
            disabled={isRunning}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            {isRunning ? (
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
                Running...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Run Suite
              </>
            )}
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/suites/edit/${suite.id}`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Test Definitions ({definitions.length})
              </CardTitle>
              <CardDescription>Tests included in this suite</CardDescription>
            </CardHeader>
            <CardContent>
              {definitions.length === 0 ? (
                <p className="text-muted-foreground">No test definitions found for this suite.</p>
              ) : (
                <div className="space-y-4">
                  {definitions.map((definition, index) => (
                    <div key={definition.id}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{definition.name}</h4>
                          <p className="text-sm text-muted-foreground">{definition.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {definition.image}
                            </Badge>
                            {definition.labels?.map((label) => (
                              <Badge key={label} variant="secondary" className="text-xs">
                                {label}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">#{index + 1}</div>
                      </div>
                      {index < definitions.length - 1 && <Separator className="mt-4" />}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Execution Mode</label>
                <p className="capitalize">{suite.executionMode}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Test Count</label>
                <p>{suite.testDefinitionIds.length} definitions</p>
              </div>

              {suite.labels && suite.labels.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Labels</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {suite.labels.map((label) => (
                      <Badge key={label} variant="secondary" className="text-xs">
                        {label}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-muted-foreground">Created</label>
                <p className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatDistanceToNow(suite.createdAt)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
