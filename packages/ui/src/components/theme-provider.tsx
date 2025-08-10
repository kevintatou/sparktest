"use client"

import * as React from "react"
import { createContext, useContext, useEffect } from "react"
import { type ThemeConfig, defaultThemeConfig, generateThemeCSS } from "./theme-config"

interface ThemeContextType {
  theme: string
  setTheme: (theme: string) => void
  config: ThemeConfig
  setConfig: (config: ThemeConfig) => void
  applyTheme: (config: ThemeConfig) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: string
  themeConfig?: ThemeConfig
  storageKey?: string
  enableColorSchemeScript?: boolean
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  themeConfig = defaultThemeConfig,
  storageKey = "tatou-ui-theme",
  enableColorSchemeScript = true,
  ...props
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState(defaultTheme)
  const [config, setConfigState] = React.useState(themeConfig)

  // Apply theme configuration to CSS variables
  const applyTheme = React.useCallback((newConfig: ThemeConfig) => {
    if (typeof document !== "undefined") {
      const css = generateThemeCSS(newConfig)
      
      // Remove existing theme style if it exists
      const existingStyle = document.getElementById("tatou-theme-css")
      if (existingStyle) {
        existingStyle.remove()
      }
      
      // Add new theme style
      const style = document.createElement("style")
      style.id = "tatou-theme-css"
      style.textContent = css
      document.head.appendChild(style)
    }
  }, [])

  // Update theme class on document
  useEffect(() => {
    const root = window.document.documentElement
    
    root.classList.remove("light", "dark")
    
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      root.classList.add(systemTheme)
    } else {
      root.classList.add(theme)
    }
  }, [theme])

  // Apply initial theme configuration
  useEffect(() => {
    applyTheme(config)
  }, [config, applyTheme])

  // Load theme from storage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedTheme = localStorage.getItem(storageKey)
      if (storedTheme) {
        setThemeState(storedTheme)
      }
    }
  }, [storageKey])

  // Save theme to storage
  const setTheme = React.useCallback((newTheme: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, newTheme)
    }
    setThemeState(newTheme)
  }, [storageKey])

  // Update config and apply immediately
  const setConfig = React.useCallback((newConfig: ThemeConfig) => {
    setConfigState(newConfig)
    applyTheme(newConfig)
  }, [applyTheme])

  const value = {
    theme,
    setTheme,
    config,
    setConfig,
    applyTheme,
  }

  return (
    <ThemeContext.Provider {...props} value={value}>
      {enableColorSchemeScript && <ColorSchemeScript />}
      <div className="min-h-screen bg-background text-foreground">
        {children}
      </div>
    </ThemeContext.Provider>
  )
}

// Script to prevent flash of unstyled content
function ColorSchemeScript() {
  const script = `
    (function() {
      function getThemePreference() {
        if (typeof localStorage !== 'undefined' && localStorage.getItem('tatou-ui-theme')) {
          return localStorage.getItem('tatou-ui-theme')
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      }
      const themePreference = getThemePreference()
      const theme = themePreference === 'system' 
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : themePreference
      document.documentElement.classList.add(theme)
    })()
  `

  return <script dangerouslySetInnerHTML={{ __html: script }} />
}

export const useTheme = () => {
  const context = useContext(ThemeContext)

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }

  return context
}

// Enhanced theme toggle hook with configuration support
export const useThemeToggle = () => {
  const { theme, setTheme } = useTheme()

  const toggleTheme = React.useCallback(() => {
    if (theme === "light") {
      setTheme("dark")
    } else if (theme === "dark") {
      setTheme("system")
    } else {
      setTheme("light")
    }
  }, [theme, setTheme])

  return { theme, setTheme, toggleTheme }
}