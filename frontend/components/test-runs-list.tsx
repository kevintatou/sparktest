"use client"

import { useState, useEffect } from "react"
import { CheckCircle, Clock, XCircle, Eye } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { fetchTestRuns, subscribeToTestRuns } from "@/lib/api-service"

export interface TestRun {
  id: string
  name: string
  image: string
  command: string[]
  status: string
  duration?: number
  created_at: string
  test_definition_id?: string
}

export function TestRunsList() {
  const [testRuns, setTestRuns] = useState<TestRun[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadTestRuns()

    // Subscribe to real-time updates
    const subscription = subscribeToTestRuns((payload) => {
      console.log("Real-time update:", payload)

      if (payload?.eventType === "INSERT") {
        setTestRuns((prev) => [payload.new, ...prev])
      } else if (payload?.eventType === "UPDATE") {
        setTestRuns((prev) => prev.map((run) => (run.id === payload.new?.id ? payload.new : run)))
      } else if (payload?.eventType === "DELETE") {
        setTestRuns((prev) => prev.filter((run) => run.id !== payload.old?.id))
      }
    })

    const refreshInterval = setInterval(() => {
      loadTestRuns()
    }, 10000)

    return () => {
      if (subscription?.unsubscribe) {
        subscription.unsubscribe()
      }
      clearInterval(refreshInterval)
    }
  }, [])

  const loadTestRuns = async () => {
    try {
      const data = await fetchTestRuns()
      setTestRuns(data)
    } catch (error) {
      toast({
        title: "Error loading test runs",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "failed":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "running":
        return (
          <div className="relative flex h-5 w-5 items-center justify-center">
            <div className="absolute h-full w-full animate-ping rounded-full bg-blue-400 opacity-30"></div>
            <Clock className="h-5 w-5 text-blue-500" />
          </div>
        )
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>
      case "failed":
        return <Badge variant="destructive">Failed</Badge>
      case "running":
        return <Badge>Running</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDuration = (duration?: number) => {
    if (!duration) return "N/A"
    const minutes = Math.floor(duration / 60)
    const seconds = duration % 60
    return `${minutes}m ${seconds}s`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading test runs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Recent Test Runs</h2>

      {testRuns.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No test runs found.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {testRuns.map((run) => (
            <Card key={run.id} className="transition-all hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(run.status)}
                    {run.name}
                    {getStatusBadge(run.status)}
                  </div>
                  <Button variant="outline" size="sm">
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 text-sm text-muted-foreground">
                  <p>
                    <strong>Image:</strong> {run.image}
                  </p>
                  <p>
                    <strong>Commands:</strong> {run.command.join(", ")}
                  </p>
                  <p>
                    <strong>Duration:</strong> {formatDuration(run.duration)}
                  </p>
                  <p>
                    <strong>Started:</strong> {new Date(run.created_at).toLocaleString()}
                  </p>
                  {run.test_definition_id && (
                    <p>
                      <strong>Test Definition:</strong> {run.test_definition_id}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
