"use client"

import { Suspense } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { TestRunsList } from "@/components/test-runs-list"
import { DashboardMetrics } from "@/components/dashboard-metrics"
import { ThemeToggle } from "@/components/theme-toggle"
import { GitHubButton } from "@/components/github-button"
import { FloatingCreateButton } from "@/components/floating-create-button"
import { SearchBox } from "@/components/search-box"
import { PageTransition } from "@/components/page-transition"
import { Skeleton } from "@/components/ui/skeleton"

function MetricsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        {Array(3)
          .fill(null)
          .map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm p-6 space-y-4"
            >
              <Skeleton className="h-4 w-20 bg-slate-200 dark:bg-slate-700" />
              <Skeleton className="h-8 w-16 bg-slate-200 dark:bg-slate-700" />
              <Skeleton className="h-3 w-32 bg-slate-100 dark:bg-slate-600" />
            </div>
          ))}
      </div>
    </div>
  )
}

function TestRunsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32 bg-slate-200 dark:bg-slate-700" />
        <Skeleton className="h-8 w-16 bg-slate-200 dark:bg-slate-700" />
      </div>
      <div className="space-y-3">
        {Array(5)
          .fill(null)
          .map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-4 rounded-full bg-slate-200 dark:bg-slate-700" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-40 bg-slate-200 dark:bg-slate-700" />
                  <Skeleton className="h-3 w-24 bg-slate-100 dark:bg-slate-600" />
                </div>
                <Skeleton className="h-3 w-20 bg-slate-100 dark:bg-slate-600" />
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}

export default function Dashboard() {
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset>
        {/* Clean, minimal header */}
        <header className="border-b border-slate-200/60 dark:border-slate-700/60 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
          <div className="flex h-14 items-center justify-between px-8 group-data-[collapsible=icon]:pl-20">
            <div className="flex items-center gap-4">
              <SearchBox />
            </div>
            <div className="flex items-center gap-3">
              <GitHubButton />
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Main Content - Modern spacing and layout */}
        <main className="min-h-screen bg-slate-50 dark:bg-slate-800 p-8 group-data-[collapsible=icon]:pl-20">
          <PageTransition>
            {/* Welcome section */}
            <div className="mb-8">
              <h1 className="text-2xl font-medium text-slate-900 dark:text-slate-100 mb-2">
                Dashboard
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Monitor your test runs and system health
              </p>
            </div>

            <div className="space-y-8">
              <Suspense fallback={<MetricsSkeleton />}>
                <DashboardMetrics />
              </Suspense>

              <Suspense fallback={<TestRunsSkeleton />}>
                <TestRunsList />
              </Suspense>
            </div>
          </PageTransition>
        </main>
      </SidebarInset>
      <FloatingCreateButton />
    </SidebarProvider>
  )
}
