# Theme Customization Guide

The `@tatou/ui` package provides comprehensive theming capabilities that allow you to completely customize colors, spacing, typography, and visual design to match your brand or design requirements.

## 🎨 Complete Color Customization

### Basic Theme Usage
```tsx
import { AppLayout, modernThemeConfig } from '@tatou/ui'

// Use a pre-built theme
<AppLayout themeConfig={modernThemeConfig}>
  {children}
</AppLayout>
```

### Available Theme Presets

#### Default Theme (OSS Style)
```tsx
import { defaultThemeConfig } from '@tatou/ui'
// Clean blue theme matching the OSS application
```

#### Modern Theme (Purple Accent)
```tsx
import { modernThemeConfig } from '@tatou/ui'
// Contemporary purple theme with rounded corners
```

#### Corporate Theme (Professional Blue)
```tsx
import { corporateThemeConfig } from '@tatou/ui'
// Professional dark blue theme with sharp corners
```

#### Minimal Theme (Black & White)
```tsx
import { minimalThemeConfig } from '@tatou/ui'
// Clean monochromatic theme with minimal styling
```

## 🛠️ Custom Theme Creation

### Create Brand-Specific Themes
```tsx
import { createBrandTheme } from '@tatou/ui'

// Create theme from your brand color (HSL hue value)
const brandTheme = createBrandTheme(
  280, // Purple hue
  85,  // Saturation level
  {
    borderRadius: { radius: "1rem" }, // Extra rounded
  }
)

<AppLayout themeConfig={brandTheme}>
  {children}
</AppLayout>
```

### Full Custom Theme Configuration
```tsx
import { createCustomTheme, type ThemeConfig } from '@tatou/ui'

const customTheme: ThemeConfig = createCustomTheme({
  colors: {
    light: {
      primary: "142.1 76.2% 36.3%", // Green primary
      secondary: "220.9 39.3% 11%",  // Dark secondary
      accent: "24.6 95% 53.1%",      // Orange accent
      destructive: "0 84.2% 60.2%",  // Red for errors
      success: "142.1 76.2% 36.3%",  // Green for success
      warning: "32.1 94.6% 43.7%",   // Orange for warnings
      // Override any other colors...
    },
    dark: {
      primary: "142.1 70.6% 45.3%",  // Lighter green for dark mode
      secondary: "220.9 39.3% 91%",   // Light secondary for dark
      // Override any other colors...
    },
  },
  borderRadius: {
    radius: "0.75rem", // Custom border radius
  },
})

<AppLayout themeConfig={customTheme}>
  {children}
</AppLayout>
```

## 🎯 Color System

### All Customizable Colors

#### Base Colors
- `background` - Main background color
- `foreground` - Primary text color
- `card` - Card background
- `cardForeground` - Card text color

#### Brand Colors
- `primary` - Primary brand color (buttons, links)
- `primaryForeground` - Text on primary color
- `secondary` - Secondary brand color
- `secondaryForeground` - Text on secondary color
- `accent` - Accent color for highlights
- `accentForeground` - Text on accent color

#### Semantic Colors
- `destructive` - Error/danger color
- `destructiveForeground` - Text on error color
- `success` - Success color
- `successForeground` - Text on success color
- `warning` - Warning color
- `warningForeground` - Text on warning color

#### Interactive Colors
- `muted` - Muted background for subtle elements
- `mutedForeground` - Muted text
- `border` - Border color
- `input` - Input field border
- `ring` - Focus ring color

#### Sidebar Colors
- `sidebarBackground` - Sidebar background
- `sidebarForeground` - Sidebar text
- `sidebarPrimary` - Sidebar primary color
- `sidebarPrimaryForeground` - Text on sidebar primary
- `sidebarAccent` - Sidebar accent color
- `sidebarAccentForeground` - Text on sidebar accent
- `sidebarBorder` - Sidebar borders
- `sidebarRing` - Sidebar focus rings

### HSL Color Format
All colors use HSL (Hue, Saturation, Lightness) format for better manipulation:
```tsx
"220.9 39.3% 11%" // hue saturation% lightness%
```

## ⚙️ Advanced Theming

### Generate Color Scales
```tsx
import { generateColorScale } from '@tatou/ui'

// Create a full color scale from your brand color
const brandScale = generateColorScale(280, 85) // Purple with 85% saturation
// Returns: { 50: "...", 100: "...", ..., 950: "..." }

// Use in custom theme
const theme = createCustomTheme({
  colors: {
    light: {
      primary: brandScale[600],
      ring: brandScale[600],
    },
    dark: {
      primary: brandScale[400],
      ring: brandScale[400],
    },
  },
})
```

### Runtime Theme Switching
```tsx
import { useTheme } from '@tatou/ui'

function ThemeCustomizer() {
  const { config, setConfig } = useTheme()
  
  const switchToPurple = () => {
    const purpleTheme = createBrandTheme(280, 85)
    setConfig(purpleTheme)
  }
  
  return (
    <Button onClick={switchToPurple}>
      Switch to Purple Theme
    </Button>
  )
}
```

### Export CSS for External Use
```tsx
import { generateThemeCSS, modernThemeConfig } from '@tatou/ui'

// Generate CSS string for use in other applications
const cssString = generateThemeCSS(modernThemeConfig)
console.log(cssString) // CSS variables ready for any application
```

## 🎨 SAAS Theming Examples

### Corporate Brand Integration
```tsx
import { createBrandTheme, AppLayout } from '@tatou/ui'

// Match your company's brand colors
const corporateBrand = createBrandTheme(
  210, // Corporate blue hue
  95,  // High saturation
  {
    borderRadius: { radius: "0.25rem" }, // Sharp, professional look
  }
)

function CorporateApp({ children }) {
  return (
    <AppLayout 
      themeConfig={corporateBrand}
      sidebarProps={{
        config: {
          name: "CorporateApp",
          version: "Enterprise",
        },
      }}
    >
      {children}
    </AppLayout>
  )
}
```

### Multi-Brand Application
```tsx
import { useTheme, themePresets } from '@tatou/ui'

function MultiBrandApp({ brandType, children }) {
  const themes = {
    startup: createBrandTheme(280, 90), // Purple
    enterprise: createBrandTheme(210, 85), // Blue
    creative: createBrandTheme(340, 75), // Pink
  }
  
  return (
    <AppLayout themeConfig={themes[brandType]}>
      {children}
    </AppLayout>
  )
}
```

### Dark Mode Customization
```tsx
import { createCustomTheme } from '@tatou/ui'

// Custom dark theme with specific colors
const customDarkTheme = createCustomTheme({
  colors: {
    light: {
      // Light mode colors...
    },
    dark: {
      background: "240 10% 3.9%",      // Nearly black
      foreground: "0 0% 98%",          // Nearly white
      primary: "142.1 76.2% 36.3%",   // Green accent
      card: "240 10% 5.9%",           // Dark cards
      // Customize any other dark mode colors...
    },
  },
})
```

## 🎯 Benefits

- **Complete Control**: Customize every color in the design system
- **Brand Consistency**: Match your exact brand colors and style
- **Dynamic Theming**: Switch themes at runtime
- **Type Safety**: Full TypeScript support for all theme properties
- **CSS Export**: Generate CSS for use in other applications
- **HSL Format**: Easy color manipulation and generation
- **Preset Library**: Start with proven color combinations

The theming system is designed to work seamlessly with the existing component library while providing unlimited customization possibilities.