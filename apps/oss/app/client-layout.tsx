"use client"

import type React from "react"

import { SimpleSidebar } from "@/components/simple-sidebar"
import { TopHeader } from "@/components/top-header"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { SidebarProvider } from "@/contexts/sidebar-context"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SidebarProvider>
        <div className="flex h-screen bg-background">
          <SimpleSidebar />
          <div className="flex flex-1 flex-col overflow-hidden lg:ml-0">
            <TopHeader />
            <main className="flex-1 overflow-auto">{children}</main>
          </div>
        </div>
        <Toaster />
      </SidebarProvider>
    </ThemeProvider>
  )
}
