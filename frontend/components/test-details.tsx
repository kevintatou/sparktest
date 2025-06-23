"use client"

import { useState, useEffect, useRef } from "react"
import { CheckCircle, Clock, RefreshCw, Terminal, XCircle } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { storage } from "@/lib/storage"
import type { Run } from "@/lib/types"
import { formatDate } from "@/lib/utils"

export function TestDetails({ run }: { run: Run }) {
  const { toast } = useToast()
  const [isRerunning, setIsRerunning] = useState(false)
  const [activeTest, setActiveTest] = useState(run)
  const [progress, setProgress] = useState(activeTest.status === "running" ? 20 : 100)
  const [logs, setLogs] = useState<string[]>([])
  const logsEndRef = useRef<HTMLDivElement>(null)
  const logIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const hasStartedLogsRef = useRef(false)

  // Simulate real-time log updates for running tests
  useEffect(() => {
    // Only start the log simulation if the test is running and we haven't started it yet
    if (activeTest.status === "running" && !hasStartedLogsRef.current) {
      hasStartedLogsRef.current = true

      const logMessages = [
        `> Starting test run...`,
        `> Using image: ${activeTest.image}`,
        `> Running command: ${activeTest.command[0]}`,
        `> Installing dependencies...`,
        `> npm install`,
      ]

      setLogs(logMessages)

      const additionalLogs = [
        "added 1342 packages in 4.2s",
        "",
        "> Running tests...",
        `> ${activeTest.command[0]}`,
        "",
        "PASS src/api/users.test.js",
        "PASS src/api/auth.test.js",
        "PASS src/api/products.test.js",
        "",
        "Test Suites: 3 passed, 3 total",
        "Tests:       24 passed, 24 total",
        "Snapshots:   0 total",
        "Time:        3.45s",
        "Ran all test suites.",
        "",
        "> Test completed successfully",
        "> Cleaning up resources...",
        "> Done!",
      ]

      let logIndex = 0
      let progressValue = 20

      logIntervalRef.current = setInterval(() => {
        if (logIndex < additionalLogs.length) {
          setLogs((prev) => [...prev, additionalLogs[logIndex]])
          logIndex++

          // Increment progress
          progressValue += Math.floor(80 / additionalLogs.length)
          setProgress(Math.min(100, progressValue))
        } else {
          if (logIntervalRef.current) {
            clearInterval(logIntervalRef.current)
            logIntervalRef.current = null
          }

          setProgress(100)

          // Update test status after a delay
          setTimeout(() => {
            const newStatus = Math.random() > 0.2 ? "completed" : "failed"

            // Update the test in localStorage
            const updatedTest = {
              ...activeTest,
              status: newStatus,
            }
            storage.updateTestRun(updatedTest)

            // Update local state
            setActiveTest(updatedTest)

            toast({
              title: newStatus === "completed" ? "Test completed successfully" : "Test failed",
              description: "View the logs for more details",
            })
          }, 1000)
        }
      }, 800)

      return () => {
        if (logIntervalRef.current) {
          clearInterval(logIntervalRef.current)
          logIntervalRef.current = null
        }
      }
    }

    // If the test status changes from running to something else, clean up
    if (activeTest.status !== "running" && logIntervalRef.current) {
      clearInterval(logIntervalRef.current)
      logIntervalRef.current = null
    }
  }, [activeTest.status, activeTest.image, activeTest.command, toast, activeTest])

  // Scroll to bottom when logs update
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [logs])

  const handleRerun = async () => {
    setIsRerunning(true)

    try {
      // Create a new test run based on the current one
      let newRun: Test

      if (activeTest.testDefinitionId) {
        // If we have a test definition ID, use that to create a new run
        newRun = await createTestRun(activeTest.testDefinitionId, {
          name: `${activeTest.name} (Rerun)`,
        })
      } else {
        // Otherwise, create a new run with the same parameters
        newRun = {
          id: `test-${Date.now()}`,
          name: `${activeTest.name} (Rerun)`,
          image: activeTest.image,
          command: activeTest.command,
          status: "running",
          createdAt: new Date().toISOString(),
        }
        updateTestRun(newRun)
      }

      // Reset state for the new test
      hasStartedLogsRef.current = false
      setActiveTest(newRun)
      setProgress(20)
      setLogs([])

      toast({
        title: "Test restarted",
        description: "Your test is now running",
      })
    } catch (error) {
      toast({
        title: "Error rerunning test",
        description: "Failed to restart the test",
        variant: "destructive",
      })
    } finally {
      setIsRerunning(false)
    }
  }

  const fetchK8sLogs = async (testId: string) => {
    try {
      const logs = await getKubernetesLogs(testId)
      setLogs(logs)
    } catch (error) {
      console.error("Error fetching K8s logs:", error)
    }
  }

  // In a real K8s integration, we would call fetchK8sLogs here:
  // useEffect(() => {
  //   if (activeTest.status === "running") {
  //     const logsInterval = setInterval(() => {
  //       fetchK8sLogs(activeTest.id)
  //     }, 3000)
  //     return () => clearInterval(logsInterval)
  //   }
  // }, [activeTest.id, activeTest.status])

  return (
    <div className="grid gap-6">
      <Card className="border-primary/20 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                {activeTest.name}
                <Badge
                  variant={
                    activeTest.status === "completed"
                      ? "success"
                      : activeTest.status === "failed"
                        ? "destructive"
                        : "default"
                  }
                  className="animate-in fade-in"
                >
                  {activeTest.status}
                </Badge>
              </CardTitle>
              <CardDescription>Created {formatDate(activeTest.createdAt)}</CardDescription>
            </div>
            <Button
              onClick={handleRerun}
              disabled={isRerunning || activeTest.status === "running"}
              className="shadow-sm"
            >
              {isRerunning ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Rerunning...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Rerun Test
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {activeTest.status === "running" && (
            <div className="mb-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Test Progress</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Container Image</h3>
              <p className="mt-1">{activeTest.image}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Job ID</h3>
              <p className="mt-1 font-mono text-sm">{activeTest.id}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Commands</h3>
              <div className="mt-1 space-y-1">
                {activeTest.command.map((cmd, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono">
                      {i + 1}
                    </Badge>
                    <code className="text-sm">{cmd}</code>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
              <div className="mt-1 flex items-center gap-2">
                {activeTest.status === "completed" && (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Completed successfully</span>
                  </>
                )}
                {activeTest.status === "failed" && (
                  <>
                    <XCircle className="h-5 w-5 text-red-500" />
                    <span>Failed with errors</span>
                  </>
                )}
                {activeTest.status === "running" && (
                  <>
                    <div className="relative flex h-5 w-5 items-center justify-center">
                      <div className="absolute h-full w-full animate-ping rounded-full bg-blue-400 opacity-30"></div>
                      <Clock className="h-5 w-5 text-blue-500" />
                    </div>
                    <span>Running...</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
        {activeTest.testDefinitionId && (
          <CardFooter className="border-t pt-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Test Definition:</span>
              <Badge variant="outline">
                <Link href={`/tests/edit/${activeTest.testDefinitionId}`} className="hover:underline">
                  {activeTest.testDefinitionId}
                </Link>
              </Badge>
            </div>
          </CardFooter>
        )}
      </Card>

      <Tabs defaultValue="logs">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="logs" className="flex items-center gap-1">
            <Terminal className="h-4 w-4" />
            Logs
          </TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="yaml">YAML</TabsTrigger>
        </TabsList>
        <TabsContent value="logs" className="mt-4 animate-in fade-in-50">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Test Logs</CardTitle>
              <CardDescription>Output from your test container</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-black text-green-400 p-4 rounded-md overflow-auto max-h-[500px] text-sm font-mono">
                {activeTest.status === "running" && logs.length === 0 ? (
                  <>
                    <div className="animate-pulse">Initializing test...</div>
                  </>
                ) : (
                  <div className="whitespace-pre-line">
                    {logs.map((line, i) => (
                      <div
                        key={i}
                        className={i === logs.length - 1 && activeTest.status === "running" ? "animate-pulse" : ""}
                      >
                        {line}
                      </div>
                    ))}
                    <div ref={logsEndRef} />

                    {activeTest.status === "running" && logs.length > 0 && (
                      <span className="inline-block animate-pulse">▋</span>
                    )}

                    {activeTest.status === "failed" && !logs.some((log) => log.includes("FAIL")) && (
                      <>
                        {`
FAIL src/api/auth.test.js
  ● Auth API › should validate user credentials

    expected 200 but received 500

    at Object.<anonymous> (src/api/auth.test.js:42:3)

PASS src/api/users.test.js
PASS src/api/products.test.js

Test Suites: 1 failed, 2 passed, 3 total
Tests:       1 failed, 23 passed, 24 total
Snapshots:   0 total
Time:        3.62s
Ran all test suites.

> Test failed with exit code 1
> Cleaning up resources...
> Done!`}
                      </>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm">
                Download Logs
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="events" className="mt-4 animate-in fade-in-50">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Kubernetes Events</CardTitle>
              <CardDescription>Events related to this test job</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <p className="font-medium">Job Created</p>
                  <p className="text-sm text-muted-foreground">{formatDate(activeTest.createdAt)}</p>
                </div>
                <div className="border-l-4 border-blue-500 pl-4">
                  <p className="font-medium">Pod Scheduled</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(new Date(new Date(activeTest.createdAt).getTime() + 2000).toISOString())}
                  </p>
                </div>
                <div className="border-l-4 border-blue-500 pl-4">
                  <p className="font-medium">Container Created</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(new Date(new Date(activeTest.createdAt).getTime() + 3000).toISOString())}
                  </p>
                </div>
                <div className="border-l-4 border-blue-500 pl-4">
                  <p className="font-medium">Container Started</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(new Date(new Date(activeTest.createdAt).getTime() + 5000).toISOString())}
                  </p>
                </div>
                {activeTest.status !== "running" && (
                  <div
                    className={`border-l-4 ${
                      activeTest.status === "completed" ? "border-green-500" : "border-red-500"
                    } pl-4`}
                  >
                    <p className="font-medium">
                      {activeTest.status === "completed" ? "Completed Successfully" : "Failed"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(new Date(new Date(activeTest.createdAt).getTime() + 30000).toISOString())}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="yaml" className="mt-4 animate-in fade-in-50">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Kubernetes YAML</CardTitle>
              <CardDescription>Generated Kubernetes job configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-slate-950 text-slate-50 p-4 rounded-md overflow-auto max-h-[500px] text-sm">
                {`apiVersion: batch/v1
kind: Job
metadata:
  name: sparktest-${activeTest.id}
  labels:
    app: sparktest
    test-name: ${activeTest.name}
spec:
  template:
    spec:
      containers:
      - name: test
        image: ${activeTest.image}
        command: ${JSON.stringify(activeTest.command)}
      restartPolicy: Never
  backoffLimit: 0`}
              </pre>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm">
                Download YAML
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
