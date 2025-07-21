"use client"

import { Button } from "@/components/ui/button"
import { Moon, Sun, Search, Github, Menu } from "lucide-react"
import { useTheme } from "next-themes"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { storage } from "@sparktest/core/storage"
import { useRouter } from "next/navigation"
import { useSidebar } from "@/contexts/sidebar-context"

export function TopHeader() {
  const { setTheme, theme } = useTheme()
  const { isMobile, isMobileMenuOpen, setIsMobileMenuOpen } = useSidebar()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const router = useRouter()

  // Search functionality (runs, definitions, and executors)
  useEffect(() => {
    const performSearch = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([])
        return
      }

      setIsSearching(true)
      try {
        const [runs, definitions, executors] = await Promise.all([
          storage.getRuns(),
          storage.getDefinitions(),
          storage.getExecutors(),
        ])

        const query = searchQuery.toLowerCase()
        const results: any[] = []

        // Search runs
        runs.forEach((run) => {
          if (run.name?.toLowerCase().includes(query) || run.id.toLowerCase().includes(query)) {
            results.push({ ...run, type: "run", href: `/runs/${run.id}` })
          }
        })

        // Search definitions
        definitions.forEach((def) => {
          if (def.name.toLowerCase().includes(query) || def.description?.toLowerCase().includes(query)) {
            results.push({ ...def, type: "definition", href: `/definitions/${def.id}` })
          }
        })

        // Search executors
        executors.forEach((exec) => {
          if (exec.name.toLowerCase().includes(query) || exec.description?.toLowerCase().includes(query)) {
            results.push({ ...exec, type: "executor", href: `/executors/${exec.id}` })
          }
        })

        setSearchResults(results.slice(0, 8)) // Limit to 8 results
      } catch (error) {
        console.error("Search failed:", error)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }

    const debounceTimer = setTimeout(performSearch, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery])

  const handleSearchSelect = (result: any) => {
    router.push(result.href)
    setSearchQuery("")
    setSearchResults([])
  }

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm px-4 sm:px-6">
      <div className="flex items-center gap-4 sm:gap-6 flex-1">
        {/* Mobile Menu Button */}
        {isMobile && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        
        {/* Search */}
        <div className="relative flex-1 max-w-sm sm:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search..."
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
                searchResults.map((result, index) => (
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
                      <div className="text-xs text-muted-foreground mt-1 truncate">{result.description}</div>
                    )}
                  </button>
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-muted-foreground">No results found</div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <Button variant="ghost" size="sm" className="gap-2 hidden sm:flex" asChild></Button>

        <Button variant="ghost" size="icon" className="sm:hidden ml-2" asChild>
          <a href="https://github.com/sparktest/sparktest" target="_blank" rel="noopener noreferrer">
            <Github className="h-4 w-4" />
          </a>
        </Button>

        <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
        <Button>
          <Github></Github>
        </Button>
      </div>
    </header>
  )
}
