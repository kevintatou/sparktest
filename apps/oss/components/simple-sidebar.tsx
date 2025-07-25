"use client"

import { usePathname } from "next/navigation"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useSidebar } from "@/contexts/sidebar-context"
import { isActiveRoute } from "@/lib/utils/navigation"
import { NAVIGATION_ITEMS, CREATE_OPTIONS } from "@/lib/navigation"
import { SidebarLogo } from "./sidebar/sidebar-logo"
import { NavigationItemComponent } from "./sidebar/navigation-item"
import { CreateOptionComponent } from "./sidebar/create-option"

export function SimpleSidebar() {
  const pathname = usePathname()
  const {
    isCreateOpen,
    setIsCreateOpen,
    dropdownRef,
    isMobile,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
  } = useSidebar()

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "flex h-full flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 transition-all duration-300 ease-in-out",
          // Desktop: always visible with fixed width
          "lg:w-16 lg:relative lg:translate-x-0",
          // Mobile: overlay with conditional visibility and width
          isMobile
            ? isMobileMenuOpen
              ? "fixed left-0 top-0 z-50 w-64 translate-x-0"
              : "fixed left-0 top-0 z-50 w-64 -translate-x-full"
            : "w-16"
        )}
      >
        {/* Logo Section */}
        <SidebarLogo />

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4">
          <div className="space-y-2">
            {NAVIGATION_ITEMS.map((item) => (
              <NavigationItemComponent
                key={item.name}
                item={item}
                isActive={isActiveRoute(pathname, item.href)}
                isMobile={isMobile}
                isMobileMenuOpen={isMobileMenuOpen}
                onMobileNavigate={() => setIsMobileMenuOpen(false)}
              />
            ))}
          </div>
        </nav>

        {/* Create Button + Dropdown */}
        <div
          className="px-3 pb-4 border-t border-slate-200 dark:border-slate-700 pt-4"
          ref={dropdownRef}
        >
          <div className="space-y-2">
            <div className="group relative">
              <Button
                size="sm"
                className={cn(
                  "relative transition-colors",
                  isMobile && isMobileMenuOpen
                    ? "w-full h-10 justify-start gap-3"
                    : "w-10 h-10 p-0",
                  isCreateOpen
                    ? "bg-blue-700 text-white shadow-lg"
                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                )}
                onClick={() => setIsCreateOpen(!isCreateOpen)}
                aria-label="Create new item"
                aria-expanded={isCreateOpen}
              >
                <Plus className={cn("h-4 w-4 transition-transform", isCreateOpen && "rotate-45")} />
                {isMobile && isMobileMenuOpen && <span>Create New</span>}

                {/* Tooltip - only show on desktop */}
                {!isMobile && (
                  <span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-black px-2 py-1 text-sm text-white opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                    Create New
                  </span>
                )}
              </Button>
            </div>

            {/* Dropdown Options */}
            <div
              className={cn(
                "space-y-1 transition-all duration-200 ease-in-out",
                isCreateOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0 overflow-hidden"
              )}
            >
              {CREATE_OPTIONS.map((option) => (
                <CreateOptionComponent
                  key={option.name}
                  option={option}
                  onClose={() => {
                    setIsCreateOpen(false)
                    if (isMobile) setIsMobileMenuOpen(false)
                  }}
                  isMobile={isMobile}
                  isMobileMenuOpen={isMobileMenuOpen}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
