"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getExecutors, initializeStorage } from "@/lib/storage-service"
import { useEffect, useState } from "react"
import type { Executor } from "@/lib/types"
import ClientLayout from "../client-layout"
import { storage } from "@/lib/storage"

export default function ExecutorsPage() {
  const [executors, setExecutors] = useState<Executor[]>([])

  useEffect(() => {
    const loadExecutors = async () => {
      const exec = await storage.getExecutors()
      setExecutors(exec)
    }

    loadExecutors()
  }, [])

  return (
    <ClientLayout>
      <div className="flex min-h-screen flex-col">
        <main className="flex-1 container py-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Executors</h1>
            <Button asChild>
              <Link href="/executors/new">Create Executor</Link>
            </Button>
          </div>
          <ul className="space-y-4">
            {executors.map((executor) => (
              <li key={executor.id} className="border rounded-lg p-4">
                <h2 className="text-lg font-semibold">{executor.name}</h2>
                <p className="text-sm text-muted-foreground">{executor.description}</p>
                <div className="mt-2 flex gap-2">
                  <Link href={`/executors/${executor.id}`} className="text-sm underline">View</Link>
                  <Link href={`/executors/edit/${executor.id}`} className="text-sm underline">Edit</Link>
                </div>
              </li>
            ))}
          </ul>
        </main>
      </div>
    </ClientLayout>
  )
}
