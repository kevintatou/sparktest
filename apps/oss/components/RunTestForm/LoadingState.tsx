"use client"

export function LoadingState() {
  return (
    <div className="text-center py-10">
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
      <p className="mt-4 text-muted-foreground">Loading test run form...</p>
    </div>
  )
}
