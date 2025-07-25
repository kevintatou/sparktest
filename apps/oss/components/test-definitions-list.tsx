"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, Play, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { storage } from "@tatou/storage-service"
import type { Definition } from "@tatou/core/types"

export function TestDefinitionsList() {
  const [testDefinitions, setTestDefinitions] = useState<Definition[]>([])
  const [loading, setLoading] = useState(true)
  const [runningTests, setRunningTests] = useState<string[]>([])
  const { toast } = useToast()

  const loadTestDefinitions = useCallback(async () => {
    try {
      const data = await storage.getDefinitions()
      setTestDefinitions(data)
    } catch (error) {
      toast({
        title: "Error loading test definitions",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadTestDefinitions()
  }, [loadTestDefinitions])

  const handleRunTest = async (testId: string) => {
    setRunningTests((prev) => [...prev, testId])

    try {
      await storage.createRun(testId)
      toast({
        title: "Test started",
        description: "Your test is now running in the background",
      })
    } catch (error) {
      toast({
        title: "Error starting test",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      })
    } finally {
      setRunningTests((prev) => prev.filter((id) => id !== testId))
    }
  }

  const handleDeleteTest = async (testId: string) => {
    try {
      await storage.deleteDefinition(testId)
      setTestDefinitions((prev) => prev.filter((test) => test.id !== testId))
      toast({
        title: "Test definition deleted",
        description: "The test definition has been removed",
      })
    } catch (error) {
      toast({
        title: "Error deleting test",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading test definitions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Test Definitions</h2>
      </div>

      {testDefinitions.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">No test definitions found.</p>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create your first test
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {testDefinitions.map((test) => (
            <Card key={test.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {test.name}
                  {test.labels && test.labels.length > 0 && (
                    <div className="flex gap-1">
                      {test.labels.slice(0, 2).map((label) => (
                        <Badge key={label} variant="outline" className="text-xs">
                          {label}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardTitle>
                <CardDescription>{test.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    <strong>Image:</strong> {test.image}
                  </p>
                  <p>
                    <strong>Commands:</strong> {test.commands.join(", ")}
                  </p>
                  {test.executorId && (
                    <p>
                      <strong>Executor:</strong> {test.executorId}
                    </p>
                  )}
                </div>
              </CardContent>
              <div className="flex gap-2 p-4 border-t">
                <Button
                  size="sm"
                  onClick={() => handleRunTest(test.id)}
                  disabled={runningTests.includes(test.id)}
                  className="flex-1"
                >
                  {runningTests.includes(test.id) ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
                      Starting...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Run
                    </>
                  )}
                </Button>
                <Button variant="outline" size="sm" className="text-blue-600 hover:text-blue-700">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteTest(test.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
