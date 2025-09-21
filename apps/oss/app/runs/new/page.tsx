"use client"

import { useEffect, useState } from "react"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { RunTestForm } from "@/components/run-test-form"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { GitHubButton } from "@/components/github-button"
import { SearchBox } from "@/components/search-box"
import { PageTransition } from "@/components/page-transition"
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
        console.error("Error loading test definitions:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchDefinitions()
  }, [])

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset>
        {/* Clean header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center justify-between px-6 group-data-[collapsible=icon]:pl-18">
            <div className="flex items-center gap-4">
              <SearchBox />
            </div>
            <div className="flex items-center gap-3">
              <GitHubButton />
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 group-data-[collapsible=icon]:pl-18">
          <PageTransition>
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="flex items-center gap-2">
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
                <p className="text-muted-foreground">
                  No test definitions found. Create one before running tests.
                </p>
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
          </PageTransition>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
