"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { RunDetails } from "@/components/run-details"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { GitHubButton } from "@/components/github-button"
import { FloatingCreateButton } from "@/components/floating-create-button"
import { SearchBox } from "@/components/search-box"
import { PageTransition } from "@/components/page-transition"
import { storage } from "@tatou/storage-service"
import type { Run } from "@tatou/core/types"

export default function TestDetailsPage({ params }: { params: { id: string } }) {
  const [run, setRun] = useState<Run | undefined>(undefined)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDefinitionById = async () => {
      try {
        const runData = await storage.getRunById(params.id)
        setRun(runData)
      } catch (error) {
        console.error("Error loading test run:", error)
      } finally {
        setLoading(false)
      }
    }
    loadDefinitionById()
  }, [params.id])

  if (loading) {
    return (
      <SidebarProvider defaultOpen={true}>
        <AppSidebar />
        <SidebarInset>
          <div className="flex min-h-screen flex-col items-center justify-center">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
              <p className="mt-4 text-muted-foreground">Loading test details...</p>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (!run) {
    return (
      <SidebarProvider defaultOpen={true}>
        <AppSidebar />
        <SidebarInset>
          <div className="flex min-h-screen flex-col items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-2">Test not found</h1>
              <p className="text-muted-foreground mb-6">The test you are looking for does not exist.</p>
              <Button asChild className="shadow-sm">
                <Link href="/">Go back to dashboard</Link>
              </Button>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset>
        {/* Clean header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center justify-between px-6 group-data-[collapsible=icon]:pl-18">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="sr-only">Back</span>
                </Link>
              </Button>
              <SearchBox />
            </div>
            <div className="flex items-center gap-3">
              <GitHubButton />
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 space-y-8 p-6 group-data-[collapsible=icon]:pl-18">
          <PageTransition>
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">Test Run Details</h1>
              </div>
              <RunDetails test={run} />
            </div>
          </PageTransition>
        </main>
      </SidebarInset>
      <FloatingCreateButton />
    </SidebarProvider>
  )
}
