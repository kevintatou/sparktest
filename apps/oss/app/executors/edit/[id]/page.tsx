"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ExecutorForm } from "@/components/executor-form"
import { storage } from "@tatou/storage-service"
import type { Executor } from "@tatou/core/types"

export default function EditExecutorPage({ params }: { params: { id: string } }) {
  const { id } = params
  const [executor, setExecutor] = useState<Executor | null>(null)

  useEffect(() => {
    const fetchExecutor = async () => {
      const exec = await storage.getExecutorById(id)
      setExecutor(exec || null)
    }
    fetchExecutor()
  }, [id])

  if (!executor) {
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
