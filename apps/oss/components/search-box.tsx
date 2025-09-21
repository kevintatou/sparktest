"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useSearch } from "@/hooks/use-search"

export function SearchBox() {
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    handleSearchSelect,
  } = useSearch()

  return (
    <div className="relative flex-1 max-w-md">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input 
        placeholder="Search..." 
        className="pl-9 bg-muted/50 border-0 focus-visible:ring-1" 
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      
      {/* Search Results */}
      {(searchResults.length > 0 || (isSearching && searchQuery.trim())) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg z-50 max-h-64 overflow-y-auto">
          {isSearching ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">Searching...</div>
          ) : searchResults.length > 0 ? (
            searchResults.map((result) => (
              <button
                key={`${result.type}-${result.id}`}
                className="w-full text-left px-3 py-2 hover:bg-muted/50 border-b border-border last:border-b-0 transition-colors"
                onClick={() => handleSearchSelect(result)}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-muted px-1.5 py-0.5 rounded capitalize font-medium">
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
  )
}
