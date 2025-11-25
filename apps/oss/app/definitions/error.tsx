"use client"

import { ErrorPage } from "@/components/error-page"

export default function DefinitionsError({
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
      title="Failed to load definitions"
      description="Unable to connect to the server. The database may be temporarily unavailable. Please try again in a moment."
      createLink={{ href: "/definitions/new", label: "Create New Definition" }}
    />
  )
}
