"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { 
  Home, 
  FileText, 
  Network, 
  Play, 
  FolderTree,
  Users,
  BarChart3,
  CreditCard,
  Puzzle,
  ScrollText,
  Settings
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const coreItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
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
    title: "Executors",
    url: "/executors",
    icon: Network,
  },
  {
    title: "Suites",
    url: "/suites",
    icon: FolderTree,
  },
]

const teamItems = [
  {
    title: "Team",
    url: "/team",
    icon: Users,
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Billing",
    url: "/billing",
    icon: CreditCard,
  },
]

const toolsItems = [
  {
    title: "Integrations",
    url: "/integrations",
    icon: Puzzle,
  },
  {
    title: "Logs",
    url: "/logs",
    icon: ScrollText,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
]

export function AppSidebar() {
  const pathname = usePathname()

  const isActive = (url: string) => pathname === url || (url !== "/" && pathname.startsWith(url))

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        {/* Core Testing */}
        <SidebarGroup>
          <SidebarGroupLabel>Testing</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {coreItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Team & Organization */}
        <SidebarGroup>
          <SidebarGroupLabel>Organization</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {teamItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Tools & Settings */}
        <SidebarGroup>
          <SidebarGroupLabel>Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {toolsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}