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
    <Sidebar collapsible="icon" className="border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
      <SidebarHeader className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <div className="flex items-center gap-3 px-4 py-5 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shrink-0">
            <Zap className="h-6 w-6" />
          </div>
          <div className="group-data-[collapsible=icon]:hidden min-w-0">
            <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100 truncate">SparkTest</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Kubernetes Testing Platform</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-white dark:bg-slate-900">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 px-3 py-2">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={pathname === item.url} 
                    tooltip={item.title}
                    className="h-10 rounded-lg transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800 data-[active=true]:bg-slate-900 dark:data-[active=true]:bg-slate-100 data-[active=true]:text-white dark:data-[active=true]:text-slate-900"
                  >
                    <Link 
                      href={item.url} 
                      className="flex items-center gap-3 px-3 text-slate-700 dark:text-slate-300"
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
      <SidebarFooter className="border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-center p-2">
          <SidebarTrigger className="h-8 w-8 rounded-md text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors" />
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}