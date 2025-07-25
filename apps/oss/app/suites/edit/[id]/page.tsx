"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SuiteForm } from "@/components/suite-form"
import { useToast } from "@/components/ui/use-toast"
import { storage } from "@tatou/storage-service"
import type { Suite } from "@tatou/core/types"

export default function EditSuitePage({ params }: { params: { id: string } }) {
  const { id } = params
  const { toast } = useToast()
  const [suite, setSuite] = useState<Suite | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSuite = async () => {
      setLoading(true)
      try {
        const loadedSuite = await storage.getSuiteById(id)
        if (!loadedSuite) {
          toast({
            title: "Suite not found",
            description: `Could not find suite with ID: ${id}`,
            variant: "destructive",
          })
          return
        }
        setSuite(loadedSuite)
      } catch (error) {
        console.error("Error loading suite:", error)
        toast({
          title: "Error loading suite",
          description: "Failed to load suite details. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadSuite()
  }, [id, toast])

  if (loading) {
    return (
      <div className="container py-6">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="flex items-center justify-center">
            <svg
              className="animate-spin h-8 w-8 text-blue-600"
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
          </div>
          <p className="text-muted-foreground mt-4">Loading suite...</p>
        </div>
      </div>
    )
  }

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
