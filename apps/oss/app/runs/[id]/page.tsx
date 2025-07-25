"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { RunDetails } from "@/components/run-details"
import { storage } from "@tatou/storage-service"
import type { Run } from "@tatou/core/types"

export default function TestDetailsPage({ params }: { params: { id: string } }) {
  const [run, setRun] = useState<Run | undefined>(undefined)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDefinitionById = async () => {
      try {
        const runData = await storage.getRunById(params.id)
        setRun(runData)
      } catch (error) {
        console.error('Error loading test run:', error)
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
          <p className="mt-4 text-muted-foreground">Loading test details...</p>
        </div>
      </div>
    )
  }

  if (!run) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted/30">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Test not found</h1>
          <p className="text-muted-foreground mb-6">The test you are looking for does not exist.</p>
          <Button asChild className="shadow-sm">
            <Link href="/">Go back to dashboard</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background to-muted/30">
      <main className="flex-1">
        <div className="container py-6">
          <div className="flex items-center gap-2 mb-6">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">Test Details</h1>
          </div>
          <RunDetails test={run} />
        </div>
      </main>
    </div>
  )
}
