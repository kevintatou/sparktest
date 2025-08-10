"use client"

// Core theme configuration types and utilities for comprehensive customization
export interface ColorScale {
  50: string
  100: string
  200: string
  300: string
  400: string
  500: string
  600: string
  700: string
  800: string
  900: string
  950: string
}

export interface ThemeColors {
  // Base colors
  background: string
  foreground: string
  card: string
  cardForeground: string
  popover: string
  popoverForeground: string
  
  // Primary brand colors
  primary: string
  primaryForeground: string
  
  // Secondary colors
  secondary: string
  secondaryForeground: string
  
  // Accent colors
  accent: string
  accentForeground: string
  
  // Semantic colors
  destructive: string
  destructiveForeground: string
  success: string
  successForeground: string
  warning: string
  warningForeground: string
  
  // Interactive colors
  muted: string
  mutedForeground: string
  border: string
  input: string
  ring: string
  
  // Sidebar specific colors
  sidebarBackground: string
  sidebarForeground: string
  sidebarPrimary: string
  sidebarPrimaryForeground: string
  sidebarAccent: string
  sidebarAccentForeground: string
  sidebarBorder: string
  sidebarRing: string
}

export interface ThemeConfig {
  colors: {
    light: ThemeColors
    dark: ThemeColors
  }
  borderRadius: {
    radius: string
  }
  spacing?: Record<string, string>
  typography?: Record<string, any>
}

export interface PartialThemeConfig {
  colors?: {
    light?: Partial<ThemeColors>
    dark?: Partial<ThemeColors>
  }
  borderRadius?: {
    radius?: string
  }
  spacing?: Record<string, string>
  typography?: Record<string, any>
}

// Default OSS theme (matches current implementation)
export const defaultThemeConfig: ThemeConfig = {
  colors: {
    light: {
      background: "0 0% 100%",
      foreground: "222.2 84% 4.9%",
      card: "0 0% 100%",
      cardForeground: "222.2 84% 4.9%",
      popover: "0 0% 100%",
      popoverForeground: "222.2 84% 4.9%",
      primary: "221.2 83.2% 53.3%",
      primaryForeground: "210 40% 98%",
      secondary: "210 40% 96%",
      secondaryForeground: "222.2 84% 4.9%",
      accent: "210 40% 96%",
      accentForeground: "222.2 84% 4.9%",
      destructive: "0 84.2% 60.2%",
      destructiveForeground: "210 40% 98%",
      success: "142.1 76.2% 36.3%",
      successForeground: "355.7 100% 97.3%",
      warning: "32.1 94.6% 43.7%",
      warningForeground: "0 0% 100%",
      muted: "210 40% 96%",
      mutedForeground: "215.4 16.3% 46.9%",
      border: "214.3 31.8% 91.4%",
      input: "214.3 31.8% 91.4%",
      ring: "221.2 83.2% 53.3%",
      sidebarBackground: "0 0% 98%",
      sidebarForeground: "240 5.3% 26.1%",
      sidebarPrimary: "240 5.9% 10%",
      sidebarPrimaryForeground: "0 0% 98%",
      sidebarAccent: "240 4.8% 95.9%",
      sidebarAccentForeground: "240 5.9% 10%",
      sidebarBorder: "220 13% 91%",
      sidebarRing: "217.2 91.2% 59.8%",
    },
    dark: {
      background: "222.2 84% 4.9%",
      foreground: "210 40% 98%",
      card: "222.2 84% 4.9%",
      cardForeground: "210 40% 98%",
      popover: "222.2 84% 4.9%",
      popoverForeground: "210 40% 98%",
      primary: "217.2 91.2% 59.8%",
      primaryForeground: "222.2 84% 4.9%",
      secondary: "217.2 32.6% 17.5%",
      secondaryForeground: "210 40% 98%",
      accent: "217.2 32.6% 17.5%",
      accentForeground: "210 40% 98%",
      destructive: "0 62.8% 30.6%",
      destructiveForeground: "210 40% 98%",
      success: "142.1 70.6% 45.3%",
      successForeground: "144.9 80.4% 10%",
      warning: "32.1 81% 50%",
      warningForeground: "20.5 90.2% 4.3%",
      muted: "217.2 32.6% 17.5%",
      mutedForeground: "215 20.2% 65.1%",
      border: "217.2 32.6% 17.5%",
      input: "217.2 32.6% 17.5%",
      ring: "224.3 76.3% 94.1%",
      sidebarBackground: "240 5.9% 10%",
      sidebarForeground: "240 4.8% 95.9%",
      sidebarPrimary: "224.3 76.3% 48%",
      sidebarPrimaryForeground: "0 0% 100%",
      sidebarAccent: "240 3.7% 15.9%",
      sidebarAccentForeground: "240 4.8% 95.9%",
      sidebarBorder: "240 3.7% 15.9%",
      sidebarRing: "217.2 91.2% 59.8%",
    },
  },
  borderRadius: {
    radius: "0.5rem",
  },
}

// Theme presets for common use cases
export const modernThemeConfig: ThemeConfig = {
  ...defaultThemeConfig,
  colors: {
    light: {
      ...defaultThemeConfig.colors.light,
      primary: "262.1 83.3% 57.8%", // Purple
      ring: "262.1 83.3% 57.8%",
      sidebarPrimary: "262.1 83.3% 57.8%",
      sidebarRing: "262.1 83.3% 57.8%",
    },
    dark: {
      ...defaultThemeConfig.colors.dark,
      primary: "263.4 70% 50.4%", // Purple
      ring: "263.4 70% 50.4%",
      sidebarPrimary: "263.4 70% 50.4%",
      sidebarRing: "263.4 70% 50.4%",
    },
  },
  borderRadius: {
    radius: "0.75rem", // More rounded
  },
}

export const corporateThemeConfig: ThemeConfig = {
  ...defaultThemeConfig,
  colors: {
    light: {
      ...defaultThemeConfig.colors.light,
      primary: "214.3 31.8% 31.4%", // Dark blue
      ring: "214.3 31.8% 31.4%",
      sidebarPrimary: "214.3 31.8% 31.4%",
      sidebarRing: "214.3 31.8% 31.4%",
    },
    dark: {
      ...defaultThemeConfig.colors.dark,
      primary: "213.3 93.9% 67.8%", // Light blue
      ring: "213.3 93.9% 67.8%",
      sidebarPrimary: "213.3 93.9% 67.8%",
      sidebarRing: "213.3 93.9% 67.8%",
    },
  },
  borderRadius: {
    radius: "0.25rem", // More angular
  },
}

export const minimalThemeConfig: ThemeConfig = {
  ...defaultThemeConfig,
  colors: {
    light: {
      ...defaultThemeConfig.colors.light,
      primary: "0 0% 9%", // Pure black
      ring: "0 0% 9%",
      sidebarPrimary: "0 0% 9%",
      sidebarRing: "0 0% 9%",
      border: "0 0% 90%", // Lighter borders
      sidebarBorder: "0 0% 90%",
    },
    dark: {
      ...defaultThemeConfig.colors.dark,
      primary: "0 0% 98%", // Pure white
      ring: "0 0% 98%",
      sidebarPrimary: "0 0% 98%",
      sidebarRing: "0 0% 98%",
    },
  },
  borderRadius: {
    radius: "0.125rem", // Minimal rounding
  },
}

// Utility functions for theme customization
export function createCustomTheme(overrides: PartialThemeConfig): ThemeConfig {
  return {
    colors: {
      light: { ...defaultThemeConfig.colors.light, ...overrides.colors?.light },
      dark: { ...defaultThemeConfig.colors.dark, ...overrides.colors?.dark },
    },
    borderRadius: { ...defaultThemeConfig.borderRadius, ...overrides.borderRadius },
    spacing: { ...defaultThemeConfig.spacing, ...overrides.spacing },
    typography: { ...defaultThemeConfig.typography, ...overrides.typography },
  }
}

export function generateThemeCSS(theme: ThemeConfig): string {
  const lightVars = Object.entries(theme.colors.light)
    .map(([key, value]) => `    --${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value};`)
    .join('\n')
  
  const darkVars = Object.entries(theme.colors.dark)
    .map(([key, value]) => `    --${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value};`)
    .join('\n')

  const radiusVar = `    --radius: ${theme.borderRadius.radius};`

  return `
@layer base {
  :root {
${lightVars}
${radiusVar}
  }

  .dark {
${darkVars}
  }
}
`
}

// Brand color generators (useful for creating consistent color schemes)
export function generateColorScale(baseHue: number, saturation: number): ColorScale {
  return {
    50: `${baseHue} ${saturation}% 97%`,
    100: `${baseHue} ${saturation}% 94%`,
    200: `${baseHue} ${saturation}% 87%`,
    300: `${baseHue} ${saturation}% 77%`,
    400: `${baseHue} ${saturation}% 65%`,
    500: `${baseHue} ${saturation}% 53%`,
    600: `${baseHue} ${saturation}% 42%`,
    700: `${baseHue} ${saturation}% 33%`,
    800: `${baseHue} ${saturation}% 25%`,
    900: `${baseHue} ${saturation}% 15%`,
    950: `${baseHue} ${saturation}% 9%`,
  }
}

// Helper to create theme from brand colors
export function createBrandTheme(
  primaryHue: number,
  primarySaturation: number = 83,
  options: PartialThemeConfig = {}
): ThemeConfig {
  const primaryScale = generateColorScale(primaryHue, primarySaturation)
  
  return createCustomTheme({
    colors: {
      light: {
        primary: primaryScale[600],
        ring: primaryScale[600],
        sidebarPrimary: primaryScale[700],
        sidebarRing: primaryScale[600],
      },
      dark: {
        primary: primaryScale[400],
        ring: primaryScale[400],
        sidebarPrimary: primaryScale[500],
        sidebarRing: primaryScale[400],
      },
    },
    ...options,
  })
}

// Export popular theme presets
export const themePresets = {
  default: defaultThemeConfig,
  modern: modernThemeConfig,
  corporate: corporateThemeConfig,
  minimal: minimalThemeConfig,
}

// Theme names for easy reference
export type ThemePresetName = keyof typeof themePresets