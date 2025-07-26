"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DefinitionForm } from "@/components/test-definition-form"
import { storage } from "@tatou/storage-service"
import type { Definition } from "@tatou/core/types"

export default function EditDefinitionPage({ params }: { params: { id: string } }) {
  const { id } = params
  const [definition, setDefinition] = useState<Definition | null>(null)

  useEffect(() => {
    const fetchDefinition = async () => {
      const def = await storage.getDefinitionById(id)
      setDefinition(def || null)
    }
    fetchDefinition()
  }, [id])

  if (!definition) {
    return (
      <div className="container py-6">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Definition not found.</p>
          <Link href="/definitions" className="mt-4 text-blue-600 hover:underline">
            ← Back to Definitions
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/definitions">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Edit Test Definition
          </h1>
          <p className="text-muted-foreground mt-1">Update your test definition</p>
        </div>
      </div>
      <div className="max-w-2xl">
        <DefinitionForm existingTest={definition} />
      </div>
    </div>
  )
}
