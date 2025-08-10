/**
 * Comprehensive examples of all reusable patterns in the @tatou/ui package
 * This demonstrates layouts, headers, status systems, actions, and sidebar configurations
 */

import React from 'react'
import {
  // Layout Components
  AppLayout,
  DashboardLayout,
  MinimalLayout,
  
  // Sidebar Components
  AppSidebar,
  SidebarProvider,
  SidebarInset,
  defaultNavigationItems,
  defaultCreateItems,
  defaultAppConfig,
  type NavigationItem,
  type CreateItem,
  type AppConfig,
  
  // Header Components
  AppHeader,
  defaultHeaderActions,
  defaultSearchConfig,
  type HeaderAction,
  type SearchEntity,
  
  // Theme Components
  themePresets,
  createBrandTheme,
  type ThemePresetName,
  
  // Status System
  defaultStatusConfig,
  getStatusConfig,
  type StatusType,
  
  // Action System
  defaultCrudActions,
  getCreateAction,
  mergeActions,
  
  // UI Components
  Button,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@tatou/ui'
import { CreditCard, Users, BarChart, Receipt, Archive, CheckCircle, Building, Mail } from 'lucide-react'

// ===== COMPLETE APPLICATION LAYOUTS =====

// Example 1: Minimal Setup - Complete App with Zero Configuration
export function MinimalSetupExample() {
  return (
    <AppLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold">Complete OSS App - Zero Config!</h1>
        <p>Sidebar, header, search, theme toggle, and notifications included.</p>
      </div>
    </AppLayout>
  )
}

// Example 2: SAAS Extension - Easy Extension of OSS Components
export function SaaSExtensionExample() {
  // Extend navigation with SAAS features
  const saasNavigation: NavigationItem[] = [
    ...defaultNavigationItems, // Keep all OSS navigation
    { title: "Billing", url: "/billing", icon: CreditCard },
    { title: "Team", url: "/team", icon: Users },
    { title: "Analytics", url: "/analytics", icon: BarChart },
  ]

  // Extend create menu with SAAS actions
  const saasCreateItems: CreateItem[] = [
    ...defaultCreateItems, // Keep all OSS create items
    {
      title: "Invite User",
      url: "/team/invite",
      description: "Add a team member",
    },
    {
      title: "New Invoice",
      url: "/billing/invoice/new",
      description: "Create a new invoice",
    },
  ]

  // Extend header actions
  const saasHeaderActions: HeaderAction[] = [
    ...defaultHeaderActions, // Keep GitHub link
    {
      label: "Upgrade",
      href: "/billing/upgrade",
      variant: "default",
      size: "sm",
    },
    {
      label: "Support",
      href: "/support",
      variant: "outline",
      size: "sm",
    },
  ]

  const handleSearch = async (query: string): Promise<SearchEntity[]> => {
    // Your SAAS search implementation
    return [
      { id: "1", name: "Sample Result", type: "billing", href: "/billing/1" },
    ]
  }

  return (
    <AppLayout
      sidebarProps={{
        navigationItems: saasNavigation,
        createItems: saasCreateItems,
        config: {
          name: "SaaSApp",
          version: "Pro",
        },
      }}
      headerProps={{
        actions: saasHeaderActions,
        onSearch: handleSearch,
        onThemeToggle: () => console.log("Toggle theme"),
      }}
    >
      <div className="p-6">
        <h1 className="text-2xl font-bold">SAAS Application</h1>
        <p>Extended OSS navigation + SAAS-specific features</p>
      </div>
    </AppLayout>
  )
}

// ===== LAYOUT VARIATIONS =====

// Example 3: Dashboard Layout - Built-in padding for dashboards
export function DashboardLayoutExample() {
  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Metric 1</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">1,234</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Metric 2</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">567</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Metric 3</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">89</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

// Example 4: Minimal Layout - No sidebar for simple pages
export function MinimalLayoutExample() {
  return (
    <MinimalLayout headerProps={{ showSearch: false }}>
      <div className="max-w-4xl mx-auto py-12 px-6">
        <h1 className="text-4xl font-bold text-center mb-8">Welcome</h1>
        <p className="text-lg text-center text-muted-foreground">
          Simple layout without sidebar for landing pages
        </p>
      </div>
    </MinimalLayout>
  )
}

// ===== STATUS SYSTEM EXAMPLES =====

// Example 5: Status Badge Usage
export function StatusExamples() {
  const statuses: StatusType[] = ["passed", "failed", "running", "pending", "error"]

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold">Status System</h2>
      <div className="flex flex-wrap gap-2">
        {statuses.map((status) => {
          const config = getStatusConfig(status)
          const StatusIcon = config.icon
          return (
            <Badge key={status} className={config.badge}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {config.label}
            </Badge>
          )
        })}
      </div>
    </div>
  )
}

// ===== ACTION SYSTEM EXAMPLES =====

// Example 6: CRUD Actions
export function CrudActionsExample() {
  const customActions = mergeActions(defaultCrudActions, [
    {
      key: "approve",
      label: "Approve",
      icon: CheckCircle,
      variant: "outline",
    },
    {
      key: "archive",
      label: "Archive", 
      icon: Archive,
      variant: "ghost",
    },
  ])

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">CRUD Actions</h2>
      <div className="flex gap-2">
        {customActions.map((action) => {
          const ActionIcon = action.icon
          return (
            <Button key={action.key} variant={action.variant} size={action.size}>
              {ActionIcon && <ActionIcon className="h-4 w-4 mr-2" />}
              {action.label}
            </Button>
          )
        })}
      </div>
    </div>
  )
}

// Example 7: Create Actions
export function CreateActionsExample() {
  const runAction = getCreateAction("run")
  const definitionAction = getCreateAction("definition")

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Create Actions</h2>
      <div className="flex gap-2">
        {runAction && (
          <Button variant={runAction.variant}>
            {runAction.icon && <runAction.icon className="h-4 w-4 mr-2" />}
            {runAction.label}
          </Button>
        )}
        {definitionAction && (
          <Button variant={definitionAction.variant}>
            {definitionAction.icon && <definitionAction.icon className="h-4 w-4 mr-2" />}
            {definitionAction.label}
          </Button>
        )}
      </div>
    </div>
  )
}

// ===== SIDEBAR-ONLY EXAMPLES =====

// Example 8: Minimal Sidebar (for backwards compatibility)
export function MinimalSidebar() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="p-4">
          <h1>Sidebar Only Setup</h1>
          <p>Uses default OSS navigation and branding</p>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

// Example 9: Cherry-Pick Navigation Items
export function CherryPickExample() {
  // Use only specific OSS navigation items + custom ones
  const customNav: NavigationItem[] = [
    defaultNavigationItems[0], // Keep Dashboard
    defaultNavigationItems[1], // Keep Runs
    { title: "Custom Feature", url: "/custom", icon: CreditCard },
  ]

  return (
    <SidebarProvider>
      <AppSidebar
        navigationItems={customNav}
        showCreateMenu={false} // Hide create menu
      />
      <SidebarInset>
        <div className="p-6">
          <h1 className="text-2xl font-bold">Cherry-Picked Navigation</h1>
          <p>Only Dashboard, Runs, and Custom Feature in sidebar</p>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

// ===== FRAMEWORK INTEGRATION =====

// Example 10: Next.js Integration Example
export function NextJsExample() {
  // Simulated Next.js Link component
  const NextLink: React.FC<{ 
    href: string
    children: React.ReactNode
    className?: string
  }> = ({ href, children, className }) => (
    <a href={href} className={className}>
      {children}
    </a>
  )

  return (
    <AppLayout
      sidebarProps={{
        LinkComponent: NextLink,
        pathname: "/dashboard", // Current pathname for active states
      }}
      headerProps={{
        LinkComponent: NextLink,
      }}
    >
      <div className="p-6">
        <h1 className="text-2xl font-bold">Next.js Integration</h1>
        <p>Using custom Link component and pathname detection</p>
      </div>
    </AppLayout>
  )
}

// ===== THEMING EXAMPLES =====

// Example 11: Custom Themed SAAS Application
export function CustomThemeSaaSExample() {
  return (
    <AppLayout
      themeConfig={createBrandTheme(280, 85, {
        borderRadius: { radius: "1rem" }
      })}
      sidebarProps={{
        navigationItems: [
          ...defaultNavigationItems,
          { title: "Billing", url: "/billing", icon: CreditCard },
          { title: "Team", url: "/team", icon: Users },
          { title: "Analytics", url: "/analytics", icon: BarChart },
        ],
        createItems: [
          ...defaultCreateItems,
          {
            title: "Invite User",
            url: "/team/invite", 
            description: "Add a team member"
          },
        ],
        config: {
          name: "BrandApp",
          version: "Pro",
        },
      }}
      headerProps={{
        actions: [
          ...defaultHeaderActions,
          {
            label: "Upgrade",
            href: "/billing/upgrade",
            variant: "default",
            size: "sm",
          },
        ],
      }}
    >
      <div className="p-6">
        <h1 className="text-2xl font-bold text-foreground mb-4">
          Custom Themed Dashboard
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-primary">Brand Colors</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Complete color customization with brand consistency
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-primary">Custom Styling</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Rounded corners and custom spacing
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-primary">Theme Presets</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Professional theme presets for quick setup
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}

// Example 12: Theme Preset Showcase
export function ThemePresetExample() {
  const [currentTheme, setCurrentTheme] = React.useState<keyof typeof themePresets>('default')
  
  const switchTheme = () => {
    const themeNames = Object.keys(themePresets) as Array<keyof typeof themePresets>
    const currentIndex = themeNames.indexOf(currentTheme)
    const nextIndex = (currentIndex + 1) % themeNames.length
    setCurrentTheme(themeNames[nextIndex])
  }
  
  return (
    <AppLayout
      themeConfig={themePresets[currentTheme]}
      headerProps={{
        actions: [
          ...defaultHeaderActions,
          {
            label: `Theme: ${currentTheme}`,
            onClick: switchTheme,
            variant: "outline",
            size: "sm",
          },
        ],
      }}
    >
      <div className="p-6">
        <h1 className="text-2xl font-bold text-foreground mb-4">
          Theme Preset: {currentTheme}
        </h1>
        <Card>
          <CardHeader>
            <CardTitle className="text-primary">Color Showcase</CardTitle>
            <CardDescription>Click the theme button in header to cycle through presets</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="default" className="bg-primary text-primary-foreground">Primary</Badge>
              <Badge variant="secondary" className="bg-secondary text-secondary-foreground">Secondary</Badge>
              <Badge variant="outline" className="border-border">Outline</Badge>
              <Badge variant="destructive" className="bg-destructive text-destructive-foreground">Destructive</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="default">Primary Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="outline">Outline Button</Button>
              <Button variant="destructive">Destructive Button</Button>
            </div>
            <p className="text-muted-foreground">
              Available presets: default, modern, corporate, minimal
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}

// Export all examples
export const examples = {
  MinimalSetupExample,
  SaaSExtensionExample,
  DashboardLayoutExample,
  MinimalLayoutExample,
  StatusExamples,
  CrudActionsExample,
  CreateActionsExample,
  MinimalSidebar,
  CherryPickExample,
  NextJsExample,
  CustomThemeSaaSExample,
  ThemePresetExample,
}