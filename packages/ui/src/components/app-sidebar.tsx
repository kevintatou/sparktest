"use client"

import type React from "react"
import { BarChart3, Play, FileText, Layers, Cpu, ZapIcon, Plus, Settings } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "./sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu"

// Types for navigation configuration
export interface NavigationItem {
  title: string
  url: string
  icon: React.ComponentType<{ className?: string }>
}

export interface CreateItem {
  title: string
  url: string
  description: string
}

export interface AppConfig {
  name: string
  version?: string
  logoIcon?: React.ComponentType<{ className?: string }>
  logoUrl?: string
}

export interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  navigationItems?: NavigationItem[]
  createItems?: CreateItem[]
  config?: AppConfig
  pathname?: string
  showCreateMenu?: boolean
  showSettings?: boolean
  settingsUrl?: string
  LinkComponent?: React.ComponentType<{ href: string; children: React.ReactNode; className?: string }>
}

// Default navigation items (can be imported and extended)
export const defaultNavigationItems: NavigationItem[] = [
  {
    title: "Dashboard",
    url: "/",
    icon: BarChart3,
  },
  {
    title: "Runs",
    url: "/runs",
    icon: Play,
  },
  {
    title: "Definitions",
    url: "/definitions",
    icon: FileText,
  },
  {
    title: "Suites",
    url: "/suites",
    icon: Layers,
  },
  {
    title: "Executors",
    url: "/executors",
    icon: Cpu,
  },
]

// Default create items (can be imported and extended)
export const defaultCreateItems: CreateItem[] = [
  {
    title: "New Run",
    url: "/runs/new",
    description: "Create a new run",
  },
  {
    title: "New Definition",
    url: "/definitions/new",
    description: "Define a new test case",
  },
  {
    title: "New Executor",
    url: "/executors/new",
    description: "Create a new executor",
  },
]

// Default app configuration
export const defaultAppConfig: AppConfig = {
  name: "SparkTest",
  version: "MVP",
  logoIcon: ZapIcon,
  logoUrl: "/",
}

// Default Link component (can be overridden for different frameworks)
const DefaultLink: React.FC<{ href: string; children: React.ReactNode; className?: string }> = ({
  href,
  children,
  className,
}) => (
  <a href={href} className={className}>
    {children}
  </a>
)

export function AppSidebar({
  navigationItems = defaultNavigationItems,
  createItems = defaultCreateItems,
  config = defaultAppConfig,
  pathname = "/",
  showCreateMenu = true,
  showSettings = true,
  settingsUrl = "/settings",
  LinkComponent = DefaultLink,
  ...props
}: AppSidebarProps) {
  const LogoIcon = config.logoIcon || ZapIcon

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip={config.name}>
              <LinkComponent href={config.logoUrl || "/"}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <LogoIcon className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{config.name}</span>
                  {config.version && (
                    <span className="truncate text-xs">{config.version}</span>
                  )}
                </div>
              </LinkComponent>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {navigationItems.map((item) => {
            const isActive =
              pathname === item.url || (item.url !== "/" && pathname.startsWith(item.url))
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                  <LinkComponent href={item.url}>
                    <item.icon className="size-4" />
                    <span>{item.title}</span>
                  </LinkComponent>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {showCreateMenu && createItems.length > 0 && (
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton tooltip="Create New">
                    <Plus className="size-4" />
                    <span>Create</span>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" side="right" align="end" sideOffset={4}>
                  {createItems.map((item) => (
                    <DropdownMenuItem key={item.title} asChild>
                      <LinkComponent href={item.url} className="flex items-center gap-2 p-2">
                        <div className="flex size-6 items-center justify-center rounded-sm border">
                          <Plus className="size-3" />
                        </div>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                          <span className="font-medium">{item.title}</span>
                          <span className="text-xs text-muted-foreground">{item.description}</span>
                        </div>
                      </LinkComponent>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          )}
          {showSettings && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Settings">
                <LinkComponent href={settingsUrl}>
                  <Settings className="size-4" />
                  <span>Settings</span>
                </LinkComponent>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}