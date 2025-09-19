"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"

export function NavbarCollapseTrigger() {
  return (
    <div className="fixed bottom-6 left-6 z-40 group-data-[collapsible=icon]:left-3">
      <SidebarTrigger className="h-10 w-10 rounded-lg border bg-background shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105" />
    </div>
  )
}
