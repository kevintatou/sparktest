"use client"

import { ErrorPage } from "@/components/error-page"

export default function RunsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <ErrorPage
      error={error}
      reset={reset}
      title="Failed to load test runs"
      description="Unable to connect to the server. The database may be temporarily unavailable. Please try again in a moment."
      createLink={{ href: "/runs/new", label: "Create New Run" }}
    />
  )
}
