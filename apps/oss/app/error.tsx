"use client"

import { ErrorPage } from "@/components/error-page"

export default function GlobalError({
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
      title="Something went wrong"
      description="An unexpected error occurred. This might be due to a connection issue with the server or database."
      icon="alert"
    />
  )
}
