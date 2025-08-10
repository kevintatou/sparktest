# AppSidebar Usage Examples

The `@tatou/ui` package provides a configurable `AppSidebar` component that can be easily reused and extended across different applications.

## Basic Usage (Minimal Setup)

For the simplest setup, just import and use the AppSidebar with default configuration:

```tsx
import { AppSidebar, SidebarProvider, SidebarInset } from '@tatou/ui'

function Layout({ children }: { children: React.ReactNode }) {
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

This gives you the complete OSS sidebar with:
- Dashboard, Runs, Definitions, Suites, Executors navigation
- Create menu with New Run, New Definition, New Executor
- Settings link
- SparkTest branding

## Custom Navigation Items

To customize navigation for a SAAS app, extend the default items:

```tsx
import { 
  AppSidebar, 
  defaultNavigationItems, 
  defaultCreateItems,
  type NavigationItem,
  type CreateItem 
} from '@tatou/ui'
import { CreditCard, Users, Building } from 'lucide-react'

// Extend default navigation with SAAS-specific items
const saasNavigationItems: NavigationItem[] = [
  ...defaultNavigationItems,
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

// Extend create menu for SAAS
const saasCreateItems: CreateItem[] = [
  ...defaultCreateItems,
  {
    title: "Invite User",
    url: "/team/invite",
    description: "Invite a team member",
  },
]

function SaasSidebar({ pathname }: { pathname: string }) {
  return (
    <AppSidebar 
      navigationItems={saasNavigationItems}
      createItems={saasCreateItems}
      pathname={pathname}
    />
  )
}
```

## Custom Branding

Customize the app branding and configuration:

```tsx
import { AppSidebar, type AppConfig } from '@tatou/ui'
import { Zap } from 'lucide-react'

const saasConfig: AppConfig = {
  name: "SparkTest Pro",
  version: "SAAS",
  logoIcon: Zap,
  logoUrl: "/dashboard",
}

function BrandedSidebar() {
  return (
    <AppSidebar 
      config={saasConfig}
      navigationItems={customNavItems}
    />
  )
}
```

## Framework Integration

### Next.js Integration

```tsx
import { AppSidebar } from '@tatou/ui'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

function NextJsSidebar() {
  const pathname = usePathname()
  
  return (
    <AppSidebar 
      pathname={pathname}
      LinkComponent={Link}
      navigationItems={customNavItems}
    />
  )
}
```

### React Router Integration

```tsx
import { AppSidebar } from '@tatou/ui'
import { Link, useLocation } from 'react-router-dom'

function RouterSidebar() {
  const location = useLocation()
  
  return (
    <AppSidebar 
      pathname={location.pathname}
      LinkComponent={Link}
      navigationItems={customNavItems}
    />
  )
}
```

## Selective Features

Disable features you don't need:

```tsx
// Minimal sidebar without create menu or settings
<AppSidebar 
  navigationItems={basicNavItems}
  showCreateMenu={false}
  showSettings={false}
/>

// Custom settings URL
<AppSidebar 
  settingsUrl="/admin/settings"
/>
```

## Complete SAAS Example

```tsx
import { 
  AppSidebar, 
  SidebarProvider, 
  SidebarInset,
  defaultNavigationItems,
  type NavigationItem 
} from '@tatou/ui'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CreditCard, Users, Building, BarChart } from 'lucide-react'

const saasNavigation: NavigationItem[] = [
  ...defaultNavigationItems,
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
    title: "Settings",
    url: "/organization",
    icon: Building,
  },
]

const saasConfig = {
  name: "SparkTest Pro",
  version: "Enterprise",
}

export function SaasLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  return (
    <SidebarProvider>
      <AppSidebar
        navigationItems={saasNavigation}
        config={saasConfig}
        pathname={pathname}
        LinkComponent={Link}
        showSettings={false} // Using custom settings in nav
      />
      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
```

## Benefits

1. **Minimal Setup**: Use defaults for quick setup
2. **Easy Extension**: Extend default navigation with spread operator
3. **Framework Agnostic**: Works with Next.js, React Router, or plain React
4. **Customizable**: Override branding, navigation, features as needed
5. **Type Safe**: Full TypeScript support with proper types
6. **Consistent**: Maintains design system consistency across apps