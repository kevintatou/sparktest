"use client"

import type React from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { SidebarProvider, SidebarInset } from "./sidebar"
import { AppSidebar, type AppSidebarProps } from "./app-sidebar"
import { AppHeader, type AppHeaderProps } from "./app-header"
import { Toaster } from "./toaster"

// Types for layout configuration
export interface LayoutConfig {
  queryClient?: QueryClient
  showToaster?: boolean
  sidebarProps?: Partial<AppSidebarProps>
  headerProps?: Partial<AppHeaderProps>
  themeProvider?: React.ComponentType<{ children: React.ReactNode }>
}

export interface AppLayoutProps extends LayoutConfig {
  children: React.ReactNode
  className?: string
}

// Default QueryClient configuration
export const defaultQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
})

// Simple theme provider fallback
const DefaultThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-background text-foreground">{children}</div>
)

export function AppLayout({
  children,
  className,
  queryClient = defaultQueryClient,
  showToaster = true,
  sidebarProps = {},
  headerProps = {},
  themeProvider: ThemeProvider = DefaultThemeProvider,
}: AppLayoutProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SidebarProvider>
          <div className={`flex h-screen bg-background ${className || ""}`}>
            <AppSidebar {...sidebarProps} />
            <SidebarInset className="flex flex-1 flex-col overflow-hidden lg:ml-0">
              <AppHeader {...headerProps} />
              <main className="flex-1 overflow-auto">{children}</main>
            </SidebarInset>
          </div>
          {showToaster && <Toaster />}
        </SidebarProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

// Minimal layout without sidebar for simple pages
export function MinimalLayout({
  children,
  className,
  queryClient = defaultQueryClient,
  showToaster = true,
  headerProps = {},
  themeProvider: ThemeProvider = DefaultThemeProvider,
}: Omit<AppLayoutProps, "sidebarProps">) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <div className={`min-h-screen bg-background ${className || ""}`}>
          <AppHeader {...headerProps} />
          <main className="flex-1">{children}</main>
          {showToaster && <Toaster />}
        </div>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

// Layout template specifically designed for dashboard-style applications
export function DashboardLayout({
  children,
  className,
  queryClient = defaultQueryClient,
  showToaster = true,
  sidebarProps = {},
  headerProps = {},
  themeProvider: ThemeProvider = DefaultThemeProvider,
}: AppLayoutProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SidebarProvider>
          <div className={`flex h-screen bg-background ${className || ""}`}>
            <AppSidebar {...sidebarProps} />
            <SidebarInset className="flex flex-1 flex-col overflow-hidden">
              <AppHeader {...headerProps} />
              <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">{children}</main>
            </SidebarInset>
          </div>
          {showToaster && <Toaster />}
        </SidebarProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}