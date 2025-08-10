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

### Minimal Setup

For the easiest setup, use the default `AppSidebar`:

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

See [SIDEBAR_USAGE.md](./SIDEBAR_USAGE.md) for comprehensive examples and [EXAMPLES.tsx](./EXAMPLES.tsx) for live code samples.

## Components

The package exports a wide range of components including:

### Application Components
- `AppSidebar` - **NEW!** Configurable application sidebar with navigation
- `defaultNavigationItems` - Default OSS navigation items (extendable)
- `defaultCreateItems` - Default create menu items (extendable)

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