"use client"

import { Suspense } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { TestRunsList } from "@/components/test-runs-list"
import { DashboardMetrics } from "@/components/dashboard-metrics"
import { ThemeToggle } from "@/components/theme-toggle"
import { GitHubButton } from "@/components/github-button"
import { FloatingCreateButton } from "@/components/floating-create-button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Search,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  MoreHorizontal,
  Filter,
  TrendingUp,
  AlertTriangle,
} from "lucide-react"

function MetricsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-48" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array(3)
          .fill(null)
          .map((_, i) => (
            <div key={i} className="rounded-lg border bg-card p-4 sm:p-6 space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-16 w-full" />
            </div>
          ))}
      </div>
    </div>
  )
}

function TestRunsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-48" />
        <div className="flex gap-2">
          {Array(4)
            .fill(null)
            .map((_, i) => (
              <Skeleton key={i} className="h-8 w-20" />
            ))}
        </div>
      </div>

      {/* Test runs */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Recent Runs</h2>
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>

        <div className="space-y-3">
          {testRuns.map((test) => (
            <Card key={test.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    {getStatusIcon(test.status)}
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium">{test.name}</h3>
                        <Badge variant="outline" className="text-xs font-mono">
                          {test.tag}
                        </Badge>
                        {getStatusBadge(test.status)}
                      </div>
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <span>Duration: {formatDuration(test.duration)}</span>
                        <span>Executed: {test.executed}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}

export default function Dashboard() {
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset>
        {/* Clean header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center justify-between px-6 group-data-[collapsible=icon]:pl-20">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search..." className="pl-9 bg-muted/50 border-0 focus-visible:ring-1" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <GitHubButton />
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 space-y-8 p-6 group-data-[collapsible=icon]:pl-20">
          {/* Simple header */}
          <div>
            <h1 className="text-2xl font-semibold">Dashboard</h1>
          </div>

          <Suspense fallback={<MetricsSkeleton />}>
            <DashboardMetrics />
          </Suspense>

          <Suspense fallback={<TestRunsSkeleton />}>
            <TestRunsList />
          </Suspense>
        </main>
      </SidebarInset>
      <FloatingCreateButton />
    </SidebarProvider>
  )
}