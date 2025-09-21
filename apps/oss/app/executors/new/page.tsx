"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ExecutorForm } from "@/components/executor-form"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { GitHubButton } from "@/components/github-button"
import { SearchBox } from "@/components/search-box"
import { PageTransition } from "@/components/page-transition"

export default function NewExecutorPage() {
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
                  <Link href="/executors">
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Back</span>
                  </Link>
                </Button>
                <h1 className="text-2xl font-bold">Create Executor</h1>
              </div>
              <ExecutorForm />
            </div>
          </PageTransition>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
