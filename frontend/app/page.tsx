import { Suspense } from "react"
import { TestRunsList } from "@/components/test-runs-list"
import { DashboardMetrics } from "@/components/dashboard-metrics"
import { Skeleton } from "@/components/ui/skeleton"

export default function Dashboard() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 space-y-4 sm:space-y-6 p-4 sm:p-6">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Monitor your Kubernetes test executions and performance metrics
          </p>
        </div>

        <Suspense fallback={<MetricsSkeleton />}>
          <DashboardMetrics />
        </Suspense>

        <Suspense fallback={<TestRunsSkeleton />}>
          <TestRunsList />
        </Suspense>
      </main>
    </div>
  )
}

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
      <div className="space-y-2">
        {Array(6)
          .fill(null)
          .map((_, i) => (
            <div key={i} className="flex items-center gap-4 rounded-lg border bg-card p-4">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
      </div>
    </div>
  )
}
