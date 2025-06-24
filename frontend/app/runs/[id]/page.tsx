"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { TestDetails } from "@/components/test-details"
import { storage } from "@/lib/storage"
import type { Test } from "@/lib/types"
import { Navbar } from "@/components/ui/navbar"

export default function TestDetailsPage({ params }: { params: { id: string } }) {
  const [test, setTest] = useState<Test | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get the test from localStorage
    const testData = storage.getRunById(params.id)
    setTest(testData || null)
    setLoading(false)
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

  if (!test) {
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
            <h1 className="text-2xl font-bold">Test Details</h1>
          </div>
          <TestDetails test={test} />
        </div>
      </main>
    </div>
  )
}
