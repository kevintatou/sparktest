/**
 * Example usage of the AppSidebar component for SAAS applications
 * This demonstrates how to extend the default navigation with custom items
 */

import React from 'react'
import { 
  AppSidebar, 
  SidebarProvider, 
  SidebarInset,
  defaultNavigationItems, 
  defaultCreateItems,
  type NavigationItem,
  type CreateItem,
  type AppConfig
} from '@tatou/ui'
import { CreditCard, Users, Building, BarChart, Mail } from 'lucide-react'

// Example: SAAS navigation extending the default OSS navigation
const saasNavigationItems: NavigationItem[] = [
  ...defaultNavigationItems, // Keep all OSS navigation (Dashboard, Runs, Definitions, Suites, Executors)
  {
    title: "Analytics", 
    url: "/analytics",
    icon: BarChart,
  },
  {
    title: "Billing",
    url: "/billing",
    icon: CreditCard,
  },
  {
    title: "Team",
    url: "/team", 
    icon: Users,
  },
  {
    title: "Organization",
    url: "/organization",
    icon: Building,
  },
]

// Example: SAAS create menu extending the defaults
const saasCreateItems: CreateItem[] = [
  ...defaultCreateItems, // Keep OSS create items (New Run, New Definition, New Executor)
  {
    title: "Invite User",
    url: "/team/invite",
    description: "Invite a team member",
  },
  {
    title: "Create Organization",
    url: "/organization/new",
    description: "Set up a new organization",
  },
]

// Example: Custom SAAS branding
const saasConfig: AppConfig = {
  name: "SparkTest Pro",
  version: "Enterprise",
  logoUrl: "/dashboard",
}

// Example: Custom Next.js Link component
interface NextLinkProps {
  href: string
  children: React.ReactNode
  className?: string
}

const NextLink: React.FC<NextLinkProps> = ({ href, children, className }) => {
  // In a real Next.js app, you'd import Link from 'next/link'
  // import Link from 'next/link'
  // return <Link href={href} className={className}>{children}</Link>
  
  // For demo purposes, using a regular anchor
  return <a href={href} className={className}>{children}</a>
}

// Example 1: Minimal setup with defaults (perfect for quick OSS-like setup)
export function MinimalSidebar() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="p-4">
          <h1>Your app content here</h1>
          <p>Uses default OSS navigation and branding</p>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

// Example 2: SAAS sidebar with extended navigation
export function SaasSidebar({ pathname }: { pathname: string }) {
  return (
    <SidebarProvider>
      <AppSidebar
        navigationItems={saasNavigationItems}
        createItems={saasCreateItems}
        config={saasConfig}
        pathname={pathname}
        LinkComponent={NextLink}
      />
      <SidebarInset>
        <div className="p-4">
          <h1>SAAS Application</h1>
          <p>Extended navigation with billing, team management, and analytics</p>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

// Example 3: Custom navigation (no OSS defaults)
const customNavigationItems: NavigationItem[] = [
  {
    title: "Home",
    url: "/",
    icon: Building,
  },
  {
    title: "Projects",
    url: "/projects",
    icon: Users,
  },
  {
    title: "Messages",
    url: "/messages", 
    icon: Mail,
  },
]

const customConfig: AppConfig = {
  name: "CustomApp",
  version: "v1.0",
}

export function CustomSidebar() {
  return (
    <SidebarProvider>
      <AppSidebar
        navigationItems={customNavigationItems}
        createItems={[]} // No create menu
        config={customConfig}
        showCreateMenu={false}
        showSettings={false}
      />
      <SidebarInset>
        <div className="p-4">
          <h1>Custom Application</h1>
          <p>Completely custom navigation, no OSS defaults</p>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

// Example 4: Mixed approach - some defaults, some custom
const mixedNavigationItems: NavigationItem[] = [
  defaultNavigationItems[0], // Keep Dashboard
  defaultNavigationItems[1], // Keep Runs
  {
    title: "Custom Feature",
    url: "/custom",
    icon: BarChart,
  },
  {
    title: "Billing",
    url: "/billing",
    icon: CreditCard,
  },
]

export function MixedSidebar() {
  return (
    <SidebarProvider>
      <AppSidebar
        navigationItems={mixedNavigationItems}
        createItems={defaultCreateItems.slice(0, 2)} // Keep first 2 create items
      />
      <SidebarInset>
        <div className="p-4">
          <h1>Mixed Application</h1>
          <p>Cherry-picked navigation items</p>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}