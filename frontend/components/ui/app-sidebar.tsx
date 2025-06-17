"use client"

import type * as React from "react"
import { ChevronDown, Plus, BarChart3, Play, FileText, Layers, Cpu, ZapIcon } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useSidebar } from "@/components/ui/sidebar"

// Navigation items
const navigationItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: BarChart3,
  },
  {
    title: "Test Runs",
    url: "/test-runs",
    icon: Play,
  },
  {
    title: "Test Definitions",
    url: "/test-definitions",
    icon: FileText,
  },
  {
    title: "Test Suites",
    url: "/test-suites",
    icon: Layers,
  },
  {
    title: "Executors",
    url: "/executors",
    icon: Cpu,
  },
]

// Create menu items
const createItems = [
  {
    title: "New Test",
    description: "Create a new test run",
  },
  {
    title: "New Definition",
    description: "Define a new test case",
  },
  {
    title: "New Suite",
    description: "Create a test suite",
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { state, setOpen, isMobile } = useSidebar()

  const handleSidebarClick = (e: React.MouseEvent) => {
    // Only handle clicks on desktop
    if (isMobile) return

    if (state === "collapsed") {
      // If collapsed, expand
      e.preventDefault()
      e.stopPropagation()
      setOpen(true)
    } else {
      // If expanded and clicking on empty space, collapse
      const target = e.target as HTMLElement
      const isClickableElement = target.closest('button, a, [role="menuitem"]')

      if (!isClickableElement) {
        e.preventDefault()
        e.stopPropagation()
        setOpen(false)
      }
    }
  }

  const handleMenuItemClick = (e: React.MouseEvent, url: string) => {
    // Stop propagation to prevent sidebar collapse
    e.stopPropagation()

    if (state === "collapsed" && !isMobile) {
      // If collapsed on desktop, expand first
      e.preventDefault()
      setOpen(true)
    } else {
      // If expanded or on mobile, navigate normally
      window.location.href = url
    }
  }

  const handleDropdownClick = (e: React.MouseEvent) => {
    // Stop propagation to prevent sidebar collapse when interacting with dropdown
    e.stopPropagation()

    if (state === "collapsed" && !isMobile) {
      e.preventDefault()
      setOpen(true)
    }
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      {/* Click handler div that covers the entire sidebar */}
      <div
        className="absolute inset-0 z-10"
        onClick={handleSidebarClick}
        aria-label={state === "collapsed" ? "Expand sidebar" : "Click empty space to collapse"}
      />

      <div className="relative z-20">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" onClick={(e) => handleMenuItemClick(e, "/")}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <ZapIcon className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">SparkTest</span>
                  <span className="truncate text-xs">Free</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton onClick={(e) => handleMenuItemClick(e, item.url)}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton onClick={handleDropdownClick}>
                    <Plus className="size-4" />
                    <span>Create</span>
                    <ChevronDown className="ml-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                  side="bottom"
                  align="end"
                  sideOffset={4}
                  onClick={(e) => e.stopPropagation()}
                >
                  {createItems.map((item) => (
                    <DropdownMenuItem key={item.title} className="gap-2 p-3">
                      <div className="flex size-6 items-center justify-center rounded-sm border">
                        <Plus className="size-4" />
                      </div>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-medium">{item.title}</span>
                        <span className="truncate text-xs text-muted-foreground">{item.description}</span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </div>

      <SidebarRail />
    </Sidebar>
  )
}
