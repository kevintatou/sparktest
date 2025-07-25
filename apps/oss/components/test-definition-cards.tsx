"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Clock, Code, Database, Plus, Server, Shield, Play } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { storage } from "@tatou/storage-service"
import { formatDistanceToNow } from "@tatou/core/utils"
import type { Definition } from "@tatou/core/types"
import { TestDefinitionTestModal } from "@/components/test-definition-test-modal"

// Map of icons for different test types
// const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
//   api: Server,
//   frontend: Code,
//   security: Shield,
//   database: Database,
// }

// Function to determine icon based on test name or description
function getIconForTest(test: Definition) {
  const testNameLower = test.name.toLowerCase()
  const descriptionLower = test.description.toLowerCase()

  if (testNameLower.includes("api") || descriptionLower.includes("api")) {
    return Server
  } else if (
    testNameLower.includes("frontend") ||
    testNameLower.includes("ui") ||
    descriptionLower.includes("frontend") ||
    descriptionLower.includes("ui")
  ) {
    return Code
  } else if (
    testNameLower.includes("security") ||
    testNameLower.includes("scan") ||
    descriptionLower.includes("security") ||
    descriptionLower.includes("scan")
  ) {
    return Shield
  } else if (
    testNameLower.includes("database") ||
    testNameLower.includes("db") ||
    descriptionLower.includes("database") ||
    descriptionLower.includes("db")
  ) {
    return Database
  }

  // Default icon
  return Server
}

// Function to generate tags based on test properties
function generateTagsForTest(test: Definition): string[] {
  const tags: string[] = []
  const testNameLower = test.name.toLowerCase()
  const descriptionLower = test.description.toLowerCase()

  if (testNameLower.includes("api") || descriptionLower.includes("api")) {
    tags.push("api")
  }
  if (
    testNameLower.includes("frontend") ||
    testNameLower.includes("ui") ||
    descriptionLower.includes("frontend") ||
    descriptionLower.includes("ui")
  ) {
    tags.push("frontend")
  }
  if (
    testNameLower.includes("security") ||
    testNameLower.includes("scan") ||
    descriptionLower.includes("security") ||
    descriptionLower.includes("scan")
  ) {
    tags.push("security")
  }
  if (
    testNameLower.includes("database") ||
    testNameLower.includes("db") ||
    descriptionLower.includes("database") ||
    descriptionLower.includes("db")
  ) {
    tags.push("database")
  }
  if (testNameLower.includes("integration") || descriptionLower.includes("integration")) {
    tags.push("integration")
  }
  if (testNameLower.includes("unit") || descriptionLower.includes("unit")) {
    tags.push("unit")
  }

  // If no tags were generated, add a generic one
  if (tags.length === 0) {
    tags.push("test")
  }

  return tags
}

export function DefinitionCards() {
  const { toast } = useToast()
  const [runningTests, setRunningTests] = useState<string[]>([])
  const [testDefinitions, setDefinitions] = useState<Definition[]>([])
  const [testModalOpen, setTestModalOpen] = useState(false)
  const [selectedTest, setSelectedTest] = useState<Definition | null>(null)
  const initializedRef = useRef(false)

  useEffect(() => {
    if (!initializedRef.current) {
      // Initialize storage on component mount
      storage.getDefinitions().then((data) => {
        setDefinitions(data)
      })
      initializedRef.current = true
    }
  }, [])

  const handleQuickRun = async (testId: string) => {
    setRunningTests((prev) => [...prev, testId])

    try {
      // Create a new test run in localStorage
      const definition = testDefinitions.find((def) => def.id === testId)
      if (definition) {
        const newRun = await storage.createRun(definition.id)

        setTimeout(() => {
          setRunningTests((prev) => prev.filter((id) => id !== testId))

          toast({
            title: "Test started successfully",
            description: `Test "${newRun.name}" is now running.`,
          })
        }, 1500)
      }
    } catch (error) {
      setRunningTests((prev) => prev.filter((id) => id !== testId))

      toast({
        title: "Error starting test",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      })
    }
  }

  const handleTestWithModal = (test: Definition) => {
    setSelectedTest(test)
    setTestModalOpen(true)
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {testDefinitions.map((test) => {
          const Icon = getIconForTest(test)
          const tags = generateTagsForTest(test)

          return (
            <Card key={test.id} className="flex flex-col transition-all hover:shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex gap-1">
                    {tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <CardTitle className="mt-4">{test.name}</CardTitle>
                <CardDescription>{test.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 text-sm text-muted-foreground">
                <div className="space-y-1">
                  <p>Image: {test.image}</p>
                  <p>Commands: {test.commands.join(", ")}</p>
                  <p className="flex items-center gap-1 mt-2">
                    <Clock className="h-3 w-3" /> Created: {formatDistanceToNow(test.createdAt)}
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-4">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/tests/edit/${test.id}`}>Edit</Link>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleTestWithModal(test)}>
                    <Play className="h-3 w-3 mr-1" />
                    Test
                  </Button>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleQuickRun(test.id)}
                  disabled={runningTests.includes(test.id)}
                >
                  {runningTests.includes(test.id) ? (
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
                    "Run"
                  )}
                </Button>
              </CardFooter>
            </Card>
          )
        })}

        <Card className="flex flex-col border-dashed border-2 bg-muted/20 hover:bg-muted/30 transition-colors">
          <div className="flex flex-col items-center justify-center h-full p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
              <Plus className="h-6 w-6 text-primary" />
            </div>
            <p className="text-muted-foreground text-center mb-4">Create a new test definition</p>
          </div>
        </Card>
      </div>

      {selectedTest && (
        <TestDefinitionTestModal
          isOpen={testModalOpen}
          onClose={() => {
            setTestModalOpen(false)
            setSelectedTest(null)
          }}
          testDefinition={selectedTest}
        />
      )}
    </>
  )
}
