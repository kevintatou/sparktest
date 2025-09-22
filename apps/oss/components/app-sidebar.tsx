"use client"

import * as React from "react"
import { Home, FileText, Network, Activity, Layers, Zap } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useOptimizedNavigation } from "@/hooks/use-optimized-navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarTrigger,
} from "@/components/ui/sidebar"

const items = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Test Runs",
    url: "/runs",
    icon: Activity,
  },
  {
    title: "Test Definitions",
    url: "/definitions",
    icon: FileText,
  },
  {
    title: "Test Suites",
    url: "/suites",
    icon: Layers,
  },
  {
    title: "Executors",
    url: "/executors",
    icon: Network,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { preload } = useOptimizedNavigation()

  // Preload all navigation routes for faster switching
  React.useEffect(() => {
    items.forEach(item => preload(item.url))
  }, [preload])

  return (
    <Sidebar collapsible="icon" className="border-r-2">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-4 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shrink-0">
            <Zap className="h-6 w-6" />
          </div>
          <div className="group-data-[collapsible=icon]:hidden min-w-0">
            <h1 className="text-lg font-bold text-sidebar-foreground truncate">SparkTest</h1>
            <p className="text-xs text-sidebar-foreground/70 truncate">Kubernetes Testing Platform</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
  
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 px-2">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={pathname === item.url} 
                    tooltip={item.title}
                    className="h-11 rounded-lg transition-all duration-200 hover:bg-sidebar-accent/50 data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground"
                  >
                    <Link 
                      href={item.url} 
                      className="flex items-center gap-3 px-3"
                      onMouseEnter={() => preload(item.url)}
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      <span className="font-medium group-data-[collapsible=icon]:hidden">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <div className="flex items-center justify-center p-2">
          <SidebarTrigger className="h-8 w-8 rounded-md hover:bg-sidebar-accent transition-colors" />
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}