import { Suspense } from "react"
import { TestRunsList } from "@/components/test-runs-list"
import { DashboardMetrics } from "@/components/dashboard-metrics"
import { Skeleton } from "@/components/ui/skeleton"

export default function Dashboard() {
  return (
    <div className="flex-1 space-y-8 p-6 md:p-8 lg:p-10">
      <div className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Monitor your Kubernetes test executions and performance metrics
          </p>
        </div>
      </div>

      <Suspense fallback={<MetricsSkeleton />}>
        <DashboardMetrics />
      </Suspense>

      <Suspense fallback={<TestRunsSkeleton />}>
        <TestRunsList />
      </Suspense>
    </div>
  )
}

function MetricsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-7 w-48" />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array(3)
          .fill(null)
          .map((_, i) => (
            <div key={i} className="rounded-xl border bg-card p-6 shadow-sm">
              <div className="space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-16 w-full" />
              </div>
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
        <Skeleton className="h-7 w-48" />
        <div className="flex gap-3">
          {Array(4)
            .fill(null)
            .map((_, i) => (
              <Skeleton key={i} className="h-9 w-24" />
            ))}
        </div>
      </div>
      <div className="space-y-3">
        {Array(6)
          .fill(null)
          .map((_, i) => (
            <div key={i} className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm">
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
