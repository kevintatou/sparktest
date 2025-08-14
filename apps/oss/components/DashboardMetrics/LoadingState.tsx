"use client"

import { Card, CardContent, CardHeader } from "@tatou/ui"

export function LoadingState() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-lg sm:text-xl font-semibold mb-1">Test Execution Overview</h2>
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading metrics...</p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-16 mb-2"></div>
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
