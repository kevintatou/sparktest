"use client"

import { useRouter } from "next/navigation"
import { useCallback } from "react"

export function useOptimizedNavigation() {
  const router = useRouter()

  const navigateWithTransition = useCallback(
    (href: string, options?: { replace?: boolean }) => {
      // Start the navigation immediately
      if (options?.replace) {
        router.replace(href)
      } else {
        router.push(href)
      }
    },
    [router]
  )

  const preloadRoute = useCallback(
    (href: string) => {
      // Preload the route for faster navigation
      router.prefetch(href)
    },
    [router]
  )

  return {
    navigate: navigateWithTransition,
    preload: preloadRoute,
  }
}
