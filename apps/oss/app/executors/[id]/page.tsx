"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useExecutor } from "@/hooks/use-queries"

export default function ExecutorDetailsPage({ params }: { params: { id: string } }) {
  const { data: executor, isLoading, error } = useExecutor(params.id)

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
        <p className="mt-4 text-muted-foreground">Loading executor...</p>
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
    <div className="container py-6">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/executors">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">{executor.name}</h1>
      </div>

      <p>
        <strong>Description:</strong> {executor.description}
      </p>
      <p>
        <strong>Image:</strong> {executor.image}
      </p>
      <p>
        <strong>Command:</strong> {executor.command}
      </p>
      <p>
        <strong>Supported File Types:</strong> {executor.supportedFileTypes?.join(", ")}
      </p>
    </div>
  )
}
