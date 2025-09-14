# @tatou/ui

Comprehensive UI package for building SparkTest applications with minimal setup. Transform basic components into complete applications with full theming, navigation, and reusable patterns.

## Overview

This package provides **multiple levels of reusability** - from individual components to complete application frameworks:

- **Complete Applications** - Zero-config layouts with sidebar, header, search, theming
- **Configurable Components** - AppSidebar, AppHeader, Status systems, Action patterns
- **Full Theming System** - Brand colors, theme presets, runtime theme switching
- **SAAS Extension** - Easy extension of OSS defaults for commercial applications

Built with:

- **React** - UI framework
- **Radix UI** - Accessible component primitives
- **Tailwind CSS** - Utility-first CSS framework
- **TypeScript** - Complete type safety

## Installation

```bash
# In your project
npm install @tatou/ui

# Peer dependencies (likely already installed)
npm install react react-dom typescript
```

## 🚀 Quick Start

### Complete Application (Zero Configuration)

The easiest way to get started - full application with sidebar, header, search, and theming:

```tsx
import { AppLayout } from "@tatou/ui"

function App({ children }) {
  return <AppLayout>{children}</AppLayout>
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

## 🎯 Key Features

- **Complete Application Layouts** - `AppLayout`, `DashboardLayout`, `MinimalLayout`
- **Configurable Sidebar** - Easy extension of OSS navigation with SAAS features
- **Header System** - Search, actions, theme toggle, notifications
- **Status & Action Systems** - Consistent styling and behavior patterns
- **Full Theme Customization** - Brand colors, presets, runtime switching
- **SAAS Ready** - Extend OSS defaults instead of rebuilding from scratch

## 🎯 Basic Components

All the standard UI primitives you need:

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

## Development

This package is part of the SparkTest monorepo. To develop:

```bash
# Install dependencies
pnpm install

# Build the package
pnpm --filter "@tatou/ui" build

# Start development
pnpm --filter "@tatou/ui" dev
```

## Styling Requirements

Components use Tailwind CSS classes and CSS variables for theming. Ensure your application includes:

1. **Tailwind CSS** configured with the UI package's color scheme
2. **CSS Variables** for theming (automatically included with AppLayout)
3. **Border radius variables** for consistent corner rounding

## TypeScript Support

All components are fully typed with TypeScript for excellent developer experience and complete type safety.

## Examples

For comprehensive usage examples and code samples, see:

- **[examples.md](./examples.md)** - Complete usage documentation with all patterns
- **[EXAMPLES.tsx](./EXAMPLES.tsx)** - 12 live visual examples with screenshots

## License

MIT License - see the LICENSE file for details.
