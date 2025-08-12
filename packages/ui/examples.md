# @tatou/ui Usage Examples

This document provides comprehensive usage examples for all components and patterns in the @tatou/ui package.

## 🚀 Complete Application Layouts

### AppLayout - Full Application Framework

Zero configuration - includes sidebar, header, search, themes:

```tsx
import { AppLayout } from "@tatou/ui"

function App({ children }) {
  return <AppLayout>{children}</AppLayout>
}
```

With customization:

```tsx
import { AppLayout } from "@tatou/ui"

;<AppLayout
  themeConfig={yourBrandTheme}
  sidebarProps={{ navigationItems: customNav }}
  headerProps={{ actions: customActions }}
>
  {children}
</AppLayout>
```

### DashboardLayout - Dashboard-Specific Layout

```tsx
import { DashboardLayout } from "@tatou/ui"

function Dashboard() {
  return <DashboardLayout>{dashboardContent}</DashboardLayout>
}
```

### MinimalLayout - Landing Pages & Marketing

```tsx
import { MinimalLayout } from "@tatou/ui"

function LandingPage() {
  return <MinimalLayout>{landingPageContent}</MinimalLayout>
}
```

### SAAS Extension (Minimal Setup)

Extend OSS defaults with your own features and branding:

```tsx
import { AppLayout, defaultNavigationItems, createBrandTheme } from "@tatou/ui"

const saasConfig = {
  themeConfig: createBrandTheme(280, 85), // Purple brand
  sidebarProps: {
    navigationItems: [...defaultNavigationItems, billingNav, teamNav],
    createItems: [...defaultCreateItems, inviteUser, newInvoice],
  },
  headerProps: {
    actions: [...defaultHeaderActions, upgradeAction, supportAction],
  },
}

function SaasApp({ children }) {
  return <AppLayout {...saasConfig}>{children}</AppLayout>
}
```

## 📊 AppSidebar Usage

### Basic Usage (Zero Config)

```tsx
import { AppSidebar, SidebarProvider, SidebarInset } from "@tatou/ui"

function Layout({ children }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  )
}
```

### Extending OSS Navigation

```tsx
import { AppSidebar, defaultNavigationItems } from "@tatou/ui"
import { CreditCard, Users } from "lucide-react"

const saasNavigation = [
  ...defaultNavigationItems, // Keep all OSS links
  { title: "Billing", url: "/billing", icon: CreditCard },
  { title: "Team", url: "/team", icon: Users },
]

<AppSidebar navigationItems={saasNavigation} />
```

### Cherry-Pick Navigation Items

```tsx
const customNav = [
  defaultNavigationItems[0], // Keep Dashboard
  defaultNavigationItems[1], // Keep Runs
  { title: "Custom Feature", url: "/custom", icon: MyIcon },
]

<AppSidebar navigationItems={customNav} />
```

### Custom Create Menu

```tsx
import { defaultCreateItems } from "@tatou/ui"

const saasCreateItems = [
  ...defaultCreateItems,
  { title: "New Invoice", icon: Receipt, action: () => createInvoice() },
  { title: "Invite User", icon: UserPlus, action: () => openInviteModal() },
]

<AppSidebar createItems={saasCreateItems} />
```

## 🎨 Configurable Header System

```tsx
import { AppHeader, defaultHeaderActions, defaultSearchConfig } from "@tatou/ui"

// Default setup
<AppHeader
  searchConfig={defaultSearchConfig}
  actions={defaultHeaderActions}
/>

// Custom search and actions
<AppHeader
  onSearch={async (query) => await searchEntities(query)}
  actions={[...defaultHeaderActions, customAction]}
  showThemeToggle={true}
/>
```

## 📊 Status Configuration System

```tsx
import { StatusBadge, getStatusConfig, defaultStatusConfig } from "@tatou/ui"

// Use default status styling
<StatusBadge status="passed" config={defaultStatusConfig} />

// Get specific status configuration
const statusConfig = getStatusConfig("failed")
<div className={statusConfig.className}>{statusConfig.label}</div>

// Alternative configurations
import { minimalStatusConfig, compactStatusConfig } from "@tatou/ui"
```

## ⚡ Action Configuration System

```tsx
import {
  defaultCrudActions,
  defaultCreateActions,
  defaultBulkActions,
  getCreateAction,
} from "@tatou/ui"

// Standard CRUD operations
const actions = defaultCrudActions // edit, copy, delete

// Entity creation
const createActions = defaultCreateActions // runs, definitions, executors

// Bulk operations
const bulkActions = defaultBulkActions // delete selected, export

// Get specific action
const newRunAction = getCreateAction("run")
```

## 🎨 Complete Theme Customization

### Theme Presets

```tsx
import { AppLayout, modernThemeConfig, corporateThemeConfig } from "@tatou/ui"

// Modern purple theme
<AppLayout themeConfig={modernThemeConfig}>{children}</AppLayout>

// Corporate blue theme
<AppLayout themeConfig={corporateThemeConfig}>{children}</AppLayout>
```

### Brand Colors from Palette

```tsx
import { createBrandTheme } from "@tatou/ui"

// Create theme from HSL hue (0-360) and saturation (0-100)
const purpleBrand = createBrandTheme(280, 85)  // Purple
const greenBrand = createBrandTheme(142, 76)   // Green
const blueBrand = createBrandTheme(200, 80)    // Blue

<AppLayout themeConfig={purpleBrand}>{children}</AppLayout>
```

### Complete Custom Colors

```tsx
import { createCustomTheme } from "@tatou/ui"

const customTheme = createCustomTheme({
  colors: {
    light: {
      primary: "142.1 76.2% 36.3%",     // Your green
      accent: "24.6 95% 53.1%",         // Your orange
      background: "0 0% 100%",          // Pure white
      foreground: "222.2 84% 4.9%",     // Dark text
      secondary: "210 40% 98%",         // Light gray
      muted: "210 40% 96%",             // Muted background
      // ... customize any of 24+ color properties
    },
    dark: {
      primary: "142.1 70.6% 45.3%",     // Lighter green for dark mode
      accent: "24.6 95% 63.1%",         // Lighter orange
      background: "222.2 84% 4.9%",     // Dark background
      foreground: "210 40% 98%",        // Light text
      // ... dark mode variations
    },
  },
  borderRadius: {
    radius: "1rem" // Custom corner rounding
  },
})

<AppLayout themeConfig={customTheme}>{children}</AppLayout>
```

### Runtime Theme Switching

```tsx
import { useTheme } from "@tatou/ui"

function ThemeSelector() {
  const { setConfig } = useTheme()

  return (
    <select onChange={(e) => setConfig(themes[e.target.value])}>
      <option value="default">Default</option>
      <option value="modern">Modern</option>
      <option value="corporate">Corporate</option>
    </select>
  )
}
```

### Available Theme Properties

You can customize these color properties in light and dark modes:

**Core Colors:**

- `primary`, `secondary`, `accent` - Main brand colors
- `background`, `foreground` - Base background and text
- `muted`, `mutedForeground` - Subtle backgrounds and text

**Semantic Colors:**

- `destructive`, `destructiveForeground` - Error states
- `success`, `successForeground` - Success states
- `warning`, `warningForeground` - Warning states

**Component Colors:**

- `card`, `cardForeground` - Card backgrounds
- `popover`, `popoverForeground` - Popover backgrounds
- `border`, `input`, `ring` - Border and focus colors
- `sidebar*` - Sidebar-specific color system

**Spacing & Layout:**

- `borderRadius.radius` - Global border radius

## Basic Component Usage

```tsx
import { Button, Card, CardContent, CardHeader, CardTitle } from "@tatou/ui"

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

## Visual Examples

For live visual examples of all components and patterns, see [EXAMPLES.tsx](./EXAMPLES.tsx) which contains 12 comprehensive examples with screenshots.
