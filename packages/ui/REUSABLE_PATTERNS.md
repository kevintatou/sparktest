# Reusable Application Patterns

This document showcases the comprehensive reusable patterns available in the `@tatou/ui` package beyond just the sidebar. These patterns enable minimal setup for SAAS applications while maintaining full customization capabilities.

## 🎯 Complete Application Layout

### Minimal Setup (Zero Configuration)

```tsx
import { AppLayout } from "@tatou/ui"

function App({ children }) {
  return <AppLayout>{children}</AppLayout>
}
```

This gives you:

- **Complete sidebar** with OSS navigation (Dashboard, Runs, Definitions, Suites, Executors)
- **Header** with search, theme toggle, and GitHub link
- **Query client** for data fetching
- **Theme provider** support
- **Toast notifications**

## 🎨 Reusable Header with Search

### Default Header

```tsx
import { AppHeader, defaultHeaderActions } from "@tatou/ui"
;<AppHeader
  onSearch={async (query) => {
    // Your search implementation
    return searchResults
  }}
  onThemeToggle={() => setTheme(theme === "dark" ? "light" : "dark")}
/>
```

### Extended for SAAS

```tsx
import { AppHeader, defaultHeaderActions, type HeaderAction } from '@tatou/ui'
import { CreditCard, Users } from 'lucide-react'

const saasActions: HeaderAction[] = [
  ...defaultHeaderActions,
  {
    label: "Billing",
    icon: CreditCard,
    href: "/billing",
    variant: "ghost",
    size: "sm",
  },
  {
    label: "Team",
    icon: Users,
    href: "/team",
    variant: "outline",
    size: "sm",
  },
]

<AppHeader actions={saasActions} />
```

## 📊 Status Configuration System

### Default Status Usage

```tsx
import { defaultStatusConfig, getStatusConfig } from "@tatou/ui"
import { Badge } from "@tatou/ui"

function StatusBadge({ status }: { status: string }) {
  const config = getStatusConfig(status)
  const StatusIcon = config.icon

  return (
    <Badge className={config.badge}>
      <StatusIcon className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  )
}
```

### Custom Status Configuration

```tsx
import { defaultStatusConfig, type StatusConfig } from "@tatou/ui"

const saasStatusConfig = {
  ...defaultStatusConfig,
  processing: {
    icon: Loader,
    color: "text-purple-500",
    bg: "bg-purple-50 dark:bg-purple-950/20",
    badge: "bg-purple-100 text-purple-700",
    label: "Processing",
  },
  archived: {
    icon: Archive,
    color: "text-gray-400",
    bg: "bg-gray-50 dark:bg-gray-950/20",
    badge: "bg-gray-100 text-gray-600",
    label: "Archived",
  },
}
```

## ⚡ Action Configuration System

### CRUD Actions

```tsx
import { defaultCrudActions, mergeActions } from "@tatou/ui"

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
```

### Entity-Specific Create Actions

```tsx
import { getCreateAction, defaultCreateActions } from "@tatou/ui"

// Get specific create action
const runAction = getCreateAction("run")

// Or extend all create actions for SAAS
const saasCreateActions = {
  ...defaultCreateActions,
  billing: {
    key: "create-invoice",
    label: "New Invoice",
    icon: Receipt,
    variant: "default",
    tooltip: "Create a new invoice",
  },
}
```

## 🎛️ Layout Templates

### Dashboard Layout (with padding)

```tsx
import { DashboardLayout } from "@tatou/ui"
;<DashboardLayout>{/* Your dashboard content with built-in padding */}</DashboardLayout>
```

### Minimal Layout (no sidebar)

```tsx
import { MinimalLayout } from "@tatou/ui"
;<MinimalLayout headerProps={{ showSearch: false }}>
  {/* Landing page or simple content */}
</MinimalLayout>
```

### Full Customization

```tsx
import { AppLayout, defaultNavigationItems, defaultHeaderActions } from '@tatou/ui'

const saasConfig = {
  sidebarProps: {
    navigationItems: [
      ...defaultNavigationItems,
      { title: "Billing", url: "/billing", icon: CreditCard },
      { title: "Team", url: "/team", icon: Users },
    ],
    config: {
      name: "SaaSApp",
      version: "Pro",
      logoUrl: "/dashboard",
    },
  },
  headerProps: {
    actions: [
      ...defaultHeaderActions,
      {
        label: "Support",
        href: "/support",
        variant: "outline" as const,
        size: "sm" as const,
      },
    ],
  },
}

<AppLayout {...saasConfig}>
  {children}
</AppLayout>
```

## 🔧 Advanced Patterns

### Complete SAAS Application Setup

```tsx
import {
  AppLayout,
  defaultNavigationItems,
  defaultCreateItems,
  defaultHeaderActions,
  defaultStatusConfig,
  defaultCrudActions,
  type NavigationItem,
  type CreateItem,
  type HeaderAction,
} from "@tatou/ui"

// Extend navigation for SAAS
const saasNavigation: NavigationItem[] = [
  ...defaultNavigationItems,
  { title: "Billing", url: "/billing", icon: CreditCard },
  { title: "Team", url: "/team", icon: Users },
  { title: "Analytics", url: "/analytics", icon: BarChart },
]

// Extend create menu for SAAS
const saasCreateItems: CreateItem[] = [
  ...defaultCreateItems,
  {
    title: "Invite User",
    url: "/team/invite",
    description: "Add a team member",
  },
  {
    title: "New Project",
    url: "/projects/new",
    description: "Create a new project",
  },
]

// Extend header actions for SAAS
const saasHeaderActions: HeaderAction[] = [
  ...defaultHeaderActions,
  {
    label: "Upgrade",
    href: "/billing/upgrade",
    variant: "default",
    size: "sm",
  },
]

function SaaSApp({ children }) {
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
        onThemeToggle: handleThemeToggle,
      }}
    >
      {children}
    </AppLayout>
  )
}
```

## 🎯 Benefits Summary

- **Minimal Setup**: Use defaults for instant functionality
- **Easy Extension**: Extend with spread operator syntax
- **No Duplication**: Reuse OSS patterns instead of recreating
- **Consistent Design**: Maintain design system across applications
- **Type Safety**: Full TypeScript support
- **Framework Agnostic**: Works with Next.js, React Router, etc.
- **Complete Theming**: Full color and visual customization capabilities

## 🎨 Complete Visual Customization

Beyond functional patterns, you can completely redesign the visual appearance:

### Theme Presets

```tsx
import { AppLayout, modernThemeConfig, corporateThemeConfig } from '@tatou/ui'

// Modern purple theme
<AppLayout themeConfig={modernThemeConfig}>
  {children}
</AppLayout>

// Professional corporate theme
<AppLayout themeConfig={corporateThemeConfig}>
  {children}
</AppLayout>
```

### Custom Brand Colors

```tsx
import { createBrandTheme } from '@tatou/ui'

// Create theme from your brand color
const brandTheme = createBrandTheme(280, 85) // Purple brand

<AppLayout themeConfig={brandTheme}>
  {children}
</AppLayout>
```

### Full Color Customization

```tsx
import { createCustomTheme } from "@tatou/ui"

const customTheme = createCustomTheme({
  colors: {
    light: {
      primary: "142.1 76.2% 36.3%", // Green
      accent: "24.6 95% 53.1%", // Orange
      // Customize any color...
    },
    dark: {
      primary: "142.1 70.6% 45.3%", // Lighter green for dark mode
      // Dark mode colors...
    },
  },
  borderRadius: { radius: "1rem" }, // Extra rounded
})
```

**See [THEME_CUSTOMIZATION.md](./THEME_CUSTOMIZATION.md) for complete theming documentation.**

Each pattern can be used independently or combined for comprehensive application frameworks.
