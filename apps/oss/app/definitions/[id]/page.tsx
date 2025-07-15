"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Play, Edit, Clock, ImageIcon, Terminal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { formatDistanceToNow } from "@sparktest/core/utils"
import { storage } from "@sparktest/core/storage"
import type { Definition } from "@sparktest/core/types"

export default function DefinitionDetailsPage({ params }: { params: { id: string } }) {
  const { toast } = useToast()
  const [definition, setDefinition] = useState<Definition | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDefinition = async () => {
      try {
        const def = await storage.getDefinitionById(params.id)
        setDefinition(def || null)
      } catch (error) {
        console.error('Error loading test definition:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchDefinition()
  }, [params.id])

  const handleRunTest = async () => {
    if (!definition) return

    setIsRunning(true)
    try {
      await storage.createRun(definition.id)
      toast({
        title: "Test started",
        description: "Your test run has been created and is starting.",
      })
    } catch (error) {
      toast({
        title: "Error starting test",
        description: "Failed to create the test run.",
        variant: "destructive",
      })
    } finally {
      setIsRunning(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-6">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading test definition...</p>
        </div>
      </div>
    )
  }

  if (!definition) {
    return (
      <div className="container py-6">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Definition not found.</p>
          <Link href="/definitions" className="mt-4 text-blue-600 hover:underline">
            ← Back to Definitions
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/definitions">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {definition.name}
          </h1>
          <p className="text-muted-foreground mt-1">{definition.description}</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleRunTest}
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
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
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
                Run Test
              </>
            )}
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/definitions/edit/${definition.id}`}>
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
                <Terminal className="h-5 w-5" />
                Commands
              </CardTitle>
              <CardDescription>Commands that will be executed for this test</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {definition.commands.map((command, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs w-8 justify-center">
                      {index + 1}
                    </Badge>
                    <code className="flex-1 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded text-sm">{command}</code>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {definition.variables && Object.keys(definition.variables).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Environment Variables</CardTitle>
                <CardDescription>Variables that will be available during test execution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(definition.variables).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2">
                      <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-sm font-medium">
                        {key}
                      </code>
                      <span>=</span>
                      <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-sm">{value}</code>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Container Image</label>
                <p className="font-mono text-sm bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded mt-1">
                  {definition.image}
                </p>
              </div>

              {definition.executorId && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Executor</label>
                  <p>{definition.executorId}</p>
                </div>
              )}

              {definition.labels && definition.labels.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Labels</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {definition.labels.map((label) => (
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
                  {formatDistanceToNow(definition.createdAt)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
