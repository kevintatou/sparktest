import { Suspense } from "react"
import Link from "next/link"
import { Zap, Code, Users, Webhook, Settings, Plus } from "lucide-react"
import { TestDefinitionsList } from "@/components/test-definitions-list"
import { TestRunsList } from "@/components/test-runs-list"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import ClientLayout from "./client-layout"
import { Navbar } from "@/components/ui/navbar"

export default function Dashboard() {
  return (
    <ClientLayout>
        <div className="flex min-h-screen flex-col bg-gradient-to-b from-background to-muted/30">
          <main className="flex-1">
            <div className="container py-6">
              <div className="grid gap-8">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                  <p className="text-muted-foreground">Manage your Kubernetes test definitions and monitor test runs</p>
                </div>

                <Suspense fallback={<TestDefinitionsSkeleton />}>
                  <TestDefinitionsList />
                </Suspense>

                <Suspense fallback={<TestRunsSkeleton />}>
                  <TestRunsList />
                </Suspense>
              </div>
            </div>
          </main>
        </div>
    </ClientLayout >
  )
}

function TestDefinitionsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array(3)
          .fill(null)
          .map((_, i) => (
            <div key={i} className="rounded-lg border p-4 space-y-3">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex gap-2">
                <Skeleton className="h-8 flex-1" />
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}

function TestRunsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      {Array(3)
        .fill(null)
        .map((_, i) => (
          <div key={i} className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-8 w-24" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        ))}
    </div>
  )
}
