"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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

const metrics = [
  {
    title: "Pass Rate",
    value: "69%",
    subtitle: "9 of 13 tests passed",
    trend: "+5%",
    color: "emerald",
    icon: CheckCircle2,
  },
  {
    title: "Failed Runs",
    value: "2",
    subtitle: "2 currently running",
    trend: "-1",
    color: "red",
    icon: XCircle,
  },
  {
    title: "Total Runs",
    value: "13",
    subtitle: "21 definitions • 8 executors",
    trend: "+3",
    color: "blue",
    icon: TrendingUp,
  },
]

const testRuns = [
  {
    id: "test-175441991470B",
    name: "React Component Unit Tests Run",
    status: "running",
    duration: null,
    executed: "8/5/2025, 8:51:54 PM",
    tag: "test-175441991470B",
  },
  {
    id: "pr-247",
    name: "React Component Unit Tests - PR #247",
    status: "completed",
    duration: "145000",
    executed: "8/5/2025, 8:19:15 PM",
    tag: "run-react-components",
  },
  {
    id: "staging-deploy",
    name: "REST API Integration Tests - Staging Deploy",
    status: "completed",
    duration: "187000",
    executed: "8/5/2025, 7:49:15 PM",
    tag: "run-api-integration",
  },
  {
    id: "e2e-chrome",
    name: "E2E User Journey Tests - Chrome",
    status: "running",
    duration: null,
    executed: "8/5/2025, 7:30:12 PM",
    tag: "run-e2e-playwright",
  },
]

function getStatusIcon(status: string) {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="h-4 w-4 text-emerald-500" />
    case "failed":
      return <XCircle className="h-4 w-4 text-red-500" />
    case "running":
      return <Clock className="h-4 w-4 text-blue-500" />
    default:
      return <AlertTriangle className="h-4 w-4 text-amber-500" />
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "completed":
      return (
        <Badge
          variant="secondary"
          className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800/50"
        >
          completed
        </Badge>
      )
    case "failed":
      return (
        <Badge
          variant="secondary"
          className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800/50"
        >
          failed
        </Badge>
      )
    case "running":
      return (
        <Badge
          variant="secondary"
          className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800/50"
        >
          running
        </Badge>
      )
    default:
      return <Badge variant="secondary">unknown</Badge>
  }
}

function formatDuration(duration: string | null) {
  if (!duration) return "Running..."
  const ms = Number.parseInt(duration)
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  return `${minutes}m ${seconds % 60}s`
}

export default function Dashboard() {
  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <SidebarInset>
        {/* Clean header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search..." className="pl-9 bg-muted/50 border-0 focus-visible:ring-1" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button size="sm" className="gap-2">
                <Play className="h-4 w-4" />
                Run Test
              </Button>
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 space-y-8 p-6">
          {/* Simple header */}
          <div>
            <h1 className="text-2xl font-semibold">Dashboard</h1>
          </div>

          {/* Clean metrics */}
          <section className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              {metrics.map((metric) => {
                const Icon = metric.icon
                return (
                  <Card key={metric.title} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                          <div className="flex items-baseline gap-2">
                            <p className="text-3xl font-bold">{metric.value}</p>
                            <span
                              className={`text-sm font-medium ${
                                metric.color === "emerald"
                                  ? "text-emerald-600"
                                  : metric.color === "red"
                                    ? "text-red-600"
                                    : "text-blue-600"
                              }`}
                            >
                              {metric.trend}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{metric.subtitle}</p>
                        </div>
                        <div
                          className={`p-3 rounded-full ${
                            metric.color === "emerald"
                              ? "bg-emerald-100 dark:bg-emerald-950/50"
                              : metric.color === "red"
                                ? "bg-red-100 dark:bg-red-950/50"
                                : "bg-blue-100 dark:bg-blue-950/50"
                          }`}
                        >
                          <Icon
                            className={`h-6 w-6 ${
                              metric.color === "emerald"
                                ? "text-emerald-600"
                                : metric.color === "red"
                                  ? "text-red-600"
                                  : "text-blue-600"
                            }`}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Status dots */}
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                <span className="text-muted-foreground">9 Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-red-500"></div>
                <span className="text-muted-foreground">2 Failed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                <span className="text-muted-foreground">2 Running</span>
              </div>
            </div>
          </section>

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
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
