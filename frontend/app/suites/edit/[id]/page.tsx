"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SuiteForm } from "@/components/suite-form"
import type { TestSuite } from "@/lib/types"

export default function EditSuitePage({ params }: { params: { id: string } }) {
  const { id } = params
  const [suite, setSuite] = useState<TestSuite | null>(null)

  useEffect(() => {
    // TODO: replace with real fetch call
    const mockSuite: TestSuite = {
      id,
      name: "API Test Suite",
      description: "Complete API testing including auth, CRUD operations, and error handling",
      testDefinitionIds: ["api-tests", "auth-tests", "error-handling-tests"],
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      executionMode: "sequential",
      labels: ["api", "backend"],
    }
    setSuite(mockSuite)
  }, [id])

  if (!suite) {
    return (
      <div className="container py-6">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Suite not found.</p>
          <Link href="/suites" className="mt-4 text-blue-600 hover:underline">
            ← Back to Suites
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/suites">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Edit Test Suite
          </h1>
          <p className="text-muted-foreground mt-1">Update your test suite configuration</p>
        </div>
      </div>
      <div className="max-w-2xl">
        <SuiteForm existingSuite={suite} />
      </div>
    </div>
  )
}
