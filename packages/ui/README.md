# @tatou/ui

Reusable UI components for SparkTest applications.

## Overview

This package contains a comprehensive set of UI components built with:

- **React** - UI framework
- **Radix UI** - Accessible component primitives
- **Tailwind CSS** - Utility-first CSS framework
- **TypeScript** - Type safety

## Installation

This package is part of the SparkTest monorepo. Install dependencies:

```bash
pnpm install
```

## Quick Start

### 🎯 Complete Application (Zero Configuration)

For the easiest setup, use the complete `AppLayout`:

```tsx
import { AppLayout } from '@tatou/ui'

function App({ children }) {
  return (
    <AppLayout>
      {children}
    </AppLayout>
  )
}
```

This gives you a complete application with sidebar, header, search, theme toggle, and notifications.

### 🎨 Header with Search and Actions

```tsx
import { AppHeader, defaultHeaderActions } from '@tatou/ui'

<AppHeader
  onSearch={async (query) => await searchEntities(query)}
  onThemeToggle={() => toggleTheme()}
  actions={defaultHeaderActions}
/>
```

### 📊 Status System

```tsx
import { defaultStatusConfig, getStatusConfig } from '@tatou/ui'

const config = getStatusConfig(status)
const StatusIcon = config.icon

<Badge className={config.badge}>
  <StatusIcon className="h-3 w-3 mr-1" />
  {config.label}
</Badge>
```

### 🛠️ Sidebar Configuration

For sidebar-only setup or customization:

```tsx
import { AppSidebar, SidebarProvider, SidebarInset } from '@tatou/ui'

function Layout({ children }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
```

This gives you the complete OSS sidebar with Dashboard, Runs, Definitions, Suites, Executors navigation, create menu, and settings.

### Extending for SAAS

Easily extend the default navigation for SAAS applications:

```tsx
import { 
  AppSidebar, 
  defaultNavigationItems, 
  type NavigationItem 
} from '@tatou/ui'
import { CreditCard, Users } from 'lucide-react'

const saasNavigation: NavigationItem[] = [
  ...defaultNavigationItems, // Keep OSS defaults
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
]

function SaasSidebar({ pathname }) {
  return (
    <AppSidebar 
      navigationItems={saasNavigation}
      pathname={pathname}
    />
  )
}
```

See [REUSABLE_PATTERNS.md](./REUSABLE_PATTERNS.md) for comprehensive examples of all reusable patterns, [SIDEBAR_USAGE.md](./SIDEBAR_USAGE.md) for sidebar-specific examples, and [EXAMPLES.tsx](./EXAMPLES.tsx) for live code samples.

## Components

The package exports a wide range of components including:

### 🚀 Application Framework Components
- `AppLayout` - **NEW!** Complete application layout with sidebar + header  
- `AppSidebar` - **NEW!** Configurable application sidebar with navigation
- `AppHeader` - **NEW!** Configurable header with search and actions
- `DashboardLayout` - **NEW!** Dashboard-specific layout with padding
- `MinimalLayout` - **NEW!** Simple layout without sidebar

### 📋 Default Configurations (Extendable)
- `defaultNavigationItems` - OSS navigation (Dashboard, Runs, Definitions, Suites, Executors)
- `defaultCreateItems` - Create menu items (New Run, New Definition, New Executor)
- `defaultHeaderActions` - Header actions (GitHub link, theme toggle)
- `defaultStatusConfig` - Status styling (passed, failed, running, pending, etc.)
- `defaultCrudActions` - CRUD operations (edit, copy, delete)
- `defaultQueryClient` - React Query configuration

### Basic Components
- `Button` - Customizable button component
- `Input` - Form input component
- `Label` - Form label component
- `Card` - Container component
- `Badge` - Status and category labels

### Layout Components
- `Sidebar` - Low-level collapsible sidebar primitives
- `Sheet` - Slide-out panel
- `Separator` - Visual divider
- `Aspect Ratio` - Maintain aspect ratios

### Form Components
- `Form` - Form wrapper with validation
- `Checkbox` - Checkbox input
- `Radio Group` - Radio button group
- `Select` - Dropdown selection
- `Switch` - Toggle switch
- `Textarea` - Multi-line text input

### Navigation Components
- `Breadcrumb` - Navigation breadcrumbs
- `Navigation Menu` - Main navigation
- `Pagination` - Page navigation
- `Tabs` - Tab navigation

### Feedback Components
- `Alert` - Status messages
- `Toast` - Notification messages
- `Progress` - Progress indicators
- `Skeleton` - Loading placeholders

### Overlay Components
- `Dialog` - Modal dialogs
- `Alert Dialog` - Confirmation dialogs
- `Popover` - Floating content
- `Tooltip` - Contextual information
- `Hover Card` - Rich hover content

### Data Display
- `Table` - Data tables
- `Chart` - Data visualization
- `Calendar` - Date selection
- `Avatar` - User avatars

### Utilities
- `cn` - Utility for merging CSS classes
- `useToast` - Toast notification hook
- `useIsMobile` - Mobile detection hook

## Basic Component Usage

```tsx
import { Button, Card, CardContent, CardHeader, CardTitle } from '@tatou/ui'

function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome</CardTitle>
      </CardHeader>
      <CardContent>
        <Button>Get Started</Button>
      </CardContent>
    </Card>
  )
}
```

## Styling

Components use Tailwind CSS classes and CSS variables for theming. Make sure your application has Tailwind CSS configured and includes the necessary CSS variables for theming.

## TypeScript

All components are fully typed with TypeScript for better development experience and type safety.