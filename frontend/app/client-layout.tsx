"use client"

import type React from "react"
import { useEffect } from "react"
import { Toaster } from "@/components/ui/toaster"
import { storage } from "@/lib/storage"
import Shell from "@/components/ui/shell"

export default function ClientLayout({ children }: { children: React.ReactNode }) {


  return (
    <>
      <Shell>

        {children}
        <Toaster />
      </Shell>
    </>
  )
}
