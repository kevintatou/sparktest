"use client"

import type React from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { SidebarProvider, SidebarInset } from "./sidebar"
import { AppSidebar, type AppSidebarProps } from "./app-sidebar"
import { AppHeader, type AppHeaderProps } from "./app-header"
import { Toaster } from "./toaster"
import { ThemeProvider, type ThemeProviderProps } from "./theme-provider"
import { type ThemeConfig } from "./theme-config"

// Types for layout configuration
export interface LayoutConfig {
  queryClient?: QueryClient
  showToaster?: boolean
  sidebarProps?: Partial<AppSidebarProps>
  headerProps?: Partial<AppHeaderProps>
  themeProvider?: React.ComponentType<{ children: React.ReactNode }>
  themeConfig?: ThemeConfig
  themeProviderProps?: Partial<ThemeProviderProps>
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
  <ThemeProvider>{children}</ThemeProvider>
)

export function AppLayout({
  children,
  className,
  queryClient = defaultQueryClient,
  showToaster = true,
  sidebarProps = {},
  headerProps = {},
  themeProvider: ThemeProviderComponent = DefaultThemeProvider,
  themeConfig,
  themeProviderProps = {},
}: AppLayoutProps) {
  const themeProps = themeConfig ? { ...themeProviderProps, themeConfig } : themeProviderProps
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProviderComponent {...themeProps}>
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
      </ThemeProviderComponent>
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
  themeProvider: ThemeProviderComponent = DefaultThemeProvider,
  themeConfig,
  themeProviderProps = {},
}: Omit<AppLayoutProps, "sidebarProps">) {
  const themeProps = themeConfig ? { ...themeProviderProps, themeConfig } : themeProviderProps
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProviderComponent {...themeProps}>
        <div className={`min-h-screen bg-background ${className || ""}`}>
          <AppHeader {...headerProps} />
          <main className="flex-1">{children}</main>
          {showToaster && <Toaster />}
        </div>
      </ThemeProviderComponent>
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
  themeProvider: ThemeProviderComponent = DefaultThemeProvider,
  themeConfig,
  themeProviderProps = {},
}: AppLayoutProps) {
  const themeProps = themeConfig ? { ...themeProviderProps, themeConfig } : themeProviderProps
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProviderComponent {...themeProps}>
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
      </ThemeProviderComponent>
    </QueryClientProvider>
  )
}