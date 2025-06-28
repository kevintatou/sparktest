"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/ui/navbar"
import { RunTestForm } from "@/components/run-test-form"
import { storage } from "@/lib/storage"
import type { Definition } from "@/lib/types"

export default function NewRunPage() {
  const [definitions, setDefinitions] = useState<Definition[]>([])
  const [selected, setSelected] = useState<Definition | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDefinitions = async () => {
      const defs = await storage.getDefinitions()
      setDefinitions(defs)
      setLoading(false)
    }
    fetchDefinitions()
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
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
              <p className="text-muted-foreground">Loading test definitions...</p>
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
