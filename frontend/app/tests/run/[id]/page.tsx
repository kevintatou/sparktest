"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { RunTestForm } from "@/components/run-test-form"
import { getTestDefinitionById, initializeStorage } from "@/lib/storage-service"
import type { TestDefinition } from "@/lib/types"

export default function RunTestPage({ params }: { params: { id: string } }) {
  const [testDefinition, setTestDefinition] = useState<TestDefinition | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Initialize storage
    initializeStorage()

    // Get the test definition from localStorage
    const definition = getTestDefinitionById(params.id)
    setTestDefinition(definition || null)
    setLoading(false)
  }, [params.id])

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted/30">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading test definition...</p>
        </div>
      </div>
    )
  }

  if (!testDefinition) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted/30">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Test definition not found</h1>
          <p className="text-muted-foreground mb-6">The test definition you are looking for does not exist.</p>
          <Button asChild className="shadow-sm">
            <Link href="/tests">Go back to tests</Link>
          </Button>
        </div>
      </div>
    )
  }

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
          <div className="mx-auto max-w-2xl">
            <div className="flex items-center gap-2 mb-6">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/tests">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="sr-only">Back</span>
                </Link>
              </Button>
              <h1 className="text-2xl font-bold">Run Test: {testDefinition.name}</h1>
            </div>
            <RunTestForm testDefinition={testDefinition} />
          </div>
        </div>
      </main>
    </div>
  )
}
