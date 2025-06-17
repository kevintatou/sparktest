"use client"

import type React from "react"
import { useEffect } from "react"
import { Toaster } from "@/components/ui/toaster"
import { initializeStorage } from "@/lib/storage-service"
import Shell from "@/components/ui/shell"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  // Initialize storage on app load
  useEffect(() => {
    initializeStorage()
  }, [])

  return (
    <>
      <Shell>

        {children}
        <Toaster />
      </Shell>
    </>
  )
}
