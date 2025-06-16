"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Play, Zap } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { TEST_EXECUTORS } from "@/lib/executors"
import { ExecutorTestModal } from "@/components/executor-test-modal"
import type { TestExecutor } from "@/lib/executors"
import { Navbar } from "@/components/ui/navbar"

export default function ExecutorsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [testModalOpen, setTestModalOpen] = useState(false)
  const [selectedExecutor, setSelectedExecutor] = useState<TestExecutor | null>(null)

  const handleTestExecutor = (executor: TestExecutor) => {
    setSelectedExecutor(executor)
    setTestModalOpen(true)
  }

  // Filter executors based on search query
  const filteredExecutors = TEST_EXECUTORS.filter(
    (executor) =>
      executor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      executor.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      executor.supportedFileTypes.some((type) => type.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background to-muted/30">
      <Navbar />
      <main className="flex-1">
        <div className="container py-6">
          <div className="flex items-center gap-2 mb-6">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">Test Executors</h1>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="relative w-full max-w-sm">
              <Input
                placeholder="Search executors..."
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
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredExecutors.map((executor) => (
              <Card key={executor.id} className="flex flex-col transition-all hover:shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">{executor.icon}</span>
                    {executor.name}
                  </CardTitle>
                  <CardDescription>{executor.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 text-sm text-muted-foreground">
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium text-foreground">Image:</p>
                      <code className="text-xs bg-muted px-2 py-1 rounded">{executor.image}</code>
                    </div>

                    <div>
                      <p className="font-medium text-foreground">File Types:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {executor.supportedFileTypes.map((type) => (
                          <Badge key={type} variant="outline" className="text-xs">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="font-medium text-foreground">Default Command:</p>
                      <code className="text-xs bg-muted px-2 py-1 rounded block mt-1">
                        {executor.defaultCommand.join(" ")}
                      </code>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-4">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/tests/new?executor=${executor.id}`}>Use Executor</Link>
                  </Button>
                  <Button size="sm" onClick={() => handleTestExecutor(executor)}>
                    <Play className="mr-2 h-4 w-4" />
                    Test
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </main>

      {selectedExecutor && (
        <ExecutorTestModal
          isOpen={testModalOpen}
          onClose={() => {
            setTestModalOpen(false)
            setSelectedExecutor(null)
          }}
          executor={selectedExecutor}
        />
      )}
    </div>
  )
}
