"use client"

import type React from "react"
import { Button } from "./button"
import { Moon, Sun, Search, Github, Menu } from "lucide-react"
import { Input } from "./input"
import { useState, useEffect } from "react"
import { cn } from "../lib/utils"

// Types for header configuration
export interface SearchEntity {
  id: string
  name: string
  type: string
  href: string
  description?: string
}

export interface SearchConfig {
  placeholder?: string
  maxResults?: number
  debounceMs?: number
  entityTypes?: string[]
}

export interface HeaderAction {
  label: string
  icon?: React.ComponentType<{ className?: string }>
  href?: string
  onClick?: () => void
  variant?: "default" | "ghost" | "outline" | "secondary" | "destructive" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  external?: boolean
  mobileHidden?: boolean
}

export interface AppHeaderProps extends React.HTMLAttributes<HTMLElement> {
  onSearch?: (query: string) => Promise<SearchEntity[]>
  searchConfig?: SearchConfig
  onThemeToggle?: () => void
  onMobileMenuToggle?: () => void
  actions?: HeaderAction[]
  showThemeToggle?: boolean
  showSearch?: boolean
  showMobileMenu?: boolean
  isMobile?: boolean
  isMobileMenuOpen?: boolean
  LinkComponent?: React.ComponentType<{
    href: string
    children: React.ReactNode
    className?: string
    target?: string
    rel?: string
  }>
}

// Default search configuration
export const defaultSearchConfig: SearchConfig = {
  placeholder: "Search...",
  maxResults: 8,
  debounceMs: 300,
  entityTypes: ["run", "definition", "executor"],
}

// Default header actions (GitHub link)
export const defaultHeaderActions: HeaderAction[] = [
  {
    label: "GitHub",
    icon: Github,
    href: "https://github.com/sparktest/sparktest",
    variant: "ghost",
    size: "icon",
    external: true,
    mobileHidden: true,
  },
]

// Default Link component
const DefaultLink: React.FC<{
  href: string
  children: React.ReactNode
  className?: string
  target?: string
  rel?: string
}> = ({ href, children, className, target, rel }) => (
  <a href={href} className={className} target={target} rel={rel}>
    {children}
  </a>
)

export function AppHeader({
  onSearch,
  searchConfig = defaultSearchConfig,
  onThemeToggle,
  onMobileMenuToggle,
  actions = defaultHeaderActions,
  showThemeToggle = true,
  showSearch = true,
  showMobileMenu = true,
  isMobile = false,
  isMobileMenuOpen = false,
  LinkComponent = DefaultLink,
  className,
  ...props
}: AppHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchEntity[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const config = { ...defaultSearchConfig, ...searchConfig }

  // Search functionality
  useEffect(() => {
    const performSearch = async () => {
      if (!searchQuery.trim() || !onSearch) {
        setSearchResults([])
        return
      }

      setIsSearching(true)
      try {
        const results = await onSearch(searchQuery)
        setSearchResults(results.slice(0, config.maxResults))
      } catch (error) {
        console.error("Search failed:", error)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }

    const debounceTimer = setTimeout(performSearch, config.debounceMs)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery, onSearch, config.maxResults, config.debounceMs])

  const handleSearchSelect = (result: SearchEntity) => {
    // Navigate to result - this would typically be handled by the parent component
    setSearchQuery("")
    setSearchResults([])
  }

  return (
    <header
      className={cn(
        "flex h-16 items-center justify-between border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm px-4 sm:px-6",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-4 sm:gap-6 flex-1">
        {/* Mobile Menu Button */}
        {showMobileMenu && isMobile && onMobileMenuToggle && (
          <Button variant="ghost" size="icon" onClick={onMobileMenuToggle} className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        )}

        {/* Search */}
        {showSearch && (
          <div className="relative flex-1 max-w-sm sm:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={config.placeholder}
              className="pl-10 bg-slate-50 dark:bg-slate-800 border-0 focus-visible:ring-1 text-sm sm:text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            {/* Search Results */}
            {(searchResults.length > 0 || isSearching) && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-lg z-50 max-h-64 overflow-y-auto">
                {isSearching ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground">Searching...</div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((result) => (
                    <button
                      key={`${result.type}-${result.id}`}
                      className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 border-b border-slate-100 dark:border-slate-700 last:border-b-0"
                      onClick={() => handleSearchSelect(result)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-slate-200 dark:bg-slate-600 px-1.5 py-0.5 rounded capitalize">
                          {result.type}
                        </span>
                        <span className="font-medium text-sm">{result.name}</span>
                      </div>
                      {result.description && (
                        <div className="text-xs text-muted-foreground mt-1 truncate">
                          {result.description}
                        </div>
                      )}
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-2 text-sm text-muted-foreground">No results found</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Custom Actions */}
        {actions.map((action, index) => {
          const ActionIcon = action.icon

          if (action.mobileHidden && isMobile) {
            return null
          }

          const buttonContent = (
            <Button
              variant={action.variant || "ghost"}
              size={action.size || "icon"}
              onClick={action.onClick}
              className={action.size === "sm" ? "gap-2 hidden sm:flex" : undefined}
            >
              {ActionIcon && <ActionIcon className="h-4 w-4" />}
              {action.size !== "icon" && action.label}
            </Button>
          )

          if (action.href) {
            return (
              <LinkComponent
                key={index}
                href={action.href}
                target={action.external ? "_blank" : undefined}
                rel={action.external ? "noopener noreferrer" : undefined}
              >
                {buttonContent}
              </LinkComponent>
            )
          }

          return <div key={index}>{buttonContent}</div>
        })}

        {/* Theme Toggle */}
        {showThemeToggle && onThemeToggle && (
          <Button variant="ghost" size="icon" onClick={onThemeToggle}>
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
        )}
      </div>
    </header>
  )
}
