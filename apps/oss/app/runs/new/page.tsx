"use client"

import { useEffect, useState } from "react"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { RunTestForm } from "@/components/run-test-form"
import { storage } from "@tatou/storage-service"
import type { Definition } from "@tatou/core/types"

export default function NewRunPage() {
  const [definitions, setDefinitions] = useState<Definition[]>([])
  const [selected, setSelected] = useState<Definition | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDefinitions = async () => {
      try {
        const defs = await storage.getDefinitions()
        setDefinitions(defs)
      } catch (error) {
        console.error('Error loading test definitions:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchDefinitions()
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <div className="container py-6">
          <div className="mx-auto max-w-2xl">
            <div className="flex items-center gap-2 mb-6">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/runs">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="sr-only">Back</span>
                </Link>
              </Button>
              <h1 className="text-2xl font-bold">Create Test Run</h1>
            </div>

            {loading ? (
              <div className="text-center py-10">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
                <p className="mt-4 text-muted-foreground">Loading test definitions...</p>
              </div>
            ) : definitions.length === 0 ? (
              <p className="text-muted-foreground">No test definitions found. Create one before running tests.</p>
            ) : selected ? (
              <RunTestForm def={selected} />
            ) : (
              <div className="space-y-4">
                <p className="text-muted-foreground">Choose a test definition to start a run:</p>
                <ul className="space-y-2">
                  {definitions.map((def) => (
                    <li key={def.id}>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => setSelected(def)}
                      >
                        {def.name}
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
