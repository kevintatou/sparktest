"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ExecutorForm } from "@/components/executor-form"
import { useExecutor } from "@/hooks/use-queries"

export default function EditExecutorPage({ params }: { params: { id: string } }) {
  const { id } = params
  const { data: executor, isLoading, error } = useExecutor(id)

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        <p className="text-muted-foreground mt-4">Loading executor...</p>
      </div>
    )
  }

  if (error || !executor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Executor not found.</p>
        <Link href="/executors">← Back to Executors</Link>
      </div>
    )
  }

  return (
    <div className="container py-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/executors">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Edit Executor</h1>
      </div>
      <ExecutorForm existingExecutor={executor} />
    </div>
  )
}
