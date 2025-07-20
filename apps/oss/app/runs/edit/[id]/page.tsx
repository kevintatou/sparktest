"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { TestDefinitionForm } from "@/components/test-definition-form"
import { storage } from "@sparktest/storage-service"
import type { Definition } from "@sparktest/core/types"

export default function EditTestPage({ params }: { params: { id: string } }) {
  const [definition, setDefinition] = useState<Definition | undefined>(undefined)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDefinitionById = async () => {
      try {
        const def = await storage.getDefinitionById(params.id)
        setDefinition(def)
      } catch (error) {
        console.error('Error loading test definition:', error)
      } finally {
        setLoading(false)
      }
    }
    loadDefinitionById()
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

  if (!definition) {
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
              <h1 className="text-2xl font-bold">Edit Test: {definition.name}</h1>
            </div>
            <TestDefinitionForm existingTest={definition} />
          </div>
        </div>
      </main>
    </div>
  )
}
