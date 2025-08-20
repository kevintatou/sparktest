"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { useTheme } from "next-themes"
import { AppLayout } from "@tatou/ui"
import { ThemeProvider } from "@/components/theme-provider"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { setTheme, theme } = useTheme()

  // Custom Link component for Next.js
  const NextLink = ({ href, children, className }: {
    href: string
    children: React.ReactNode
    className?: string
  }) => (
    <Link href={href} className={className}>
      {children}
    </Link>
  )

  // Handle theme toggle
  const handleThemeToggle = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  // Handle search (placeholder implementation)
  const handleSearch = async (query: string) => {
    // This would typically search across runs, definitions, etc.
    // For now, return empty results
    return []
  }

  return (
    <AppLayout 
      sidebarProps={{ 
        pathname,
        LinkComponent: NextLink
      }}
      headerProps={{
        LinkComponent: NextLink,
        onThemeToggle: handleThemeToggle,
        onSearch: handleSearch
      }}
      themeProvider={({ children }) => (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      )}
    >
      {children}
    </AppLayout>
  )
}
