"use client"

import { usePathname } from "next/navigation"
import { Plus, Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
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
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { useSidebar as useCustomSidebar } from "@/hooks/use-sidebar"
import { useIsMobile } from "@/hooks/use-mobile"
import { isActiveRoute } from "@/lib/utils/navigation"
import { NAVIGATION_ITEMS, CREATE_OPTIONS } from "@/lib/constants/navigation"
import { SidebarLogo } from "./sidebar-logo"
import { CreateOptionComponent } from "./create-option"

function SidebarNavigation() {
  const pathname = usePathname()
  const { isCreateOpen, setIsCreateOpen, dropdownRef } = useCustomSidebar()
  const { isMobile } = useSidebar()

  return (
    <>
      <SidebarHeader>
        <SidebarLogo />
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAVIGATION_ITEMS.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActiveRoute(pathname, item.href)}
                    tooltip={item.name}
                  >
                    <a href={item.href}>
                      <item.icon />
                      <span>{item.name}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div ref={dropdownRef}>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => setIsCreateOpen(!isCreateOpen)}
                    className={cn(
                      "w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg",
                      isCreateOpen && "bg-blue-700"
                    )}
                  >
                    <Plus className={cn("transition-transform", isCreateOpen && "rotate-45")} />
                    <span>Create New</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Mobile-friendly Create Options */}
          {isCreateOpen && (
            <div className="mt-2 space-y-1">
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {CREATE_OPTIONS.map((option) => (
                      <SidebarMenuItem key={option.name}>
                        <SidebarMenuButton
                          asChild
                          size="sm"
                          className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-muted-foreground"
                        >
                          <a
                            href={option.href}
                            onClick={() => setIsCreateOpen(false)}
                          >
                            <option.icon />
                            <span>{option.name}</span>
                          </a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </div>
          )}
        </div>
      </SidebarFooter>
    </>
  )
}

export function ResponsiveSidebar() {
  const isMobile = useIsMobile()

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background">
        {/* Mobile Menu Trigger */}
        {isMobile && (
          <div className="fixed top-4 left-4 z-50 md:hidden">
            <SidebarTrigger />
          </div>
        )}

        <Sidebar collapsible={isMobile ? "offcanvas" : "icon"}>
          <SidebarNavigation />
        </Sidebar>

        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Desktop sidebar trigger */}
          {!isMobile && (
            <div className="flex items-center border-b p-4">
              <SidebarTrigger />
            </div>
          )}
          
          {/* Main content will be rendered by parent component */}
          <main className="flex-1 overflow-auto">
            {/* This will be replaced by the actual content */}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}