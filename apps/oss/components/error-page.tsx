"use client"

import { useEffect } from "react"
import { AlertTriangle, XCircle, RefreshCw, Home, Plus } from "lucide-react"
import Link from "next/link"

interface ErrorDetailsProps {
  error: Error & { digest?: string }
}

function ErrorDetails({ error }: ErrorDetailsProps) {
  if (process.env.NODE_ENV !== "development" || !error.message) {
    return null
  }

  return (
    <div className="mt-6 p-3 bg-slate-100 dark:bg-slate-700 rounded-lg text-left">
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Error details:</p>
      <code className="text-xs text-red-600 dark:text-red-400 break-all">{error.message}</code>
    </div>
  )
}

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
  title: string
  description: string
  icon?: "alert" | "x-circle"
  createLink?: { href: string; label: string }
}

export function ErrorPage({
  error,
  reset,
  title,
  description,
  icon = "x-circle",
  createLink,
}: ErrorPageProps) {
  useEffect(() => {
    console.error("Page error:", error)
  }, [error])

  const IconComponent = icon === "alert" ? AlertTriangle : XCircle

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="h-16 w-16 mx-auto rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <IconComponent className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
        </div>

        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">{title}</h1>

        <p className="text-slate-600 dark:text-slate-400 mb-6">{description}</p>

        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-medium rounded-lg hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>

          {createLink && (
            <Link
              href={createLink.href}
              className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm font-medium rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              {createLink.label}
            </Link>
          )}

          <Link
            href="/"
            className={`w-full px-4 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              createLink
                ? "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                : "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600"
            }`}
          >
            <Home className="h-4 w-4" />
            Go Home
          </Link>
        </div>

        <ErrorDetails error={error} />
      </div>
    </div>
  )
}
