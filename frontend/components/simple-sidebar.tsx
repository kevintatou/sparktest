"use client"

import { usePathname } from "next/navigation"
import { Plus, Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useSidebar } from "@/hooks/use-sidebar"
import { useIsMobile } from "@/hooks/use-mobile"
import { isActiveRoute } from "@/lib/utils/navigation"
import { NAVIGATION_ITEMS, CREATE_OPTIONS } from "@/lib/constants/navigation"
import { SidebarLogo } from "./sidebar/sidebar-logo"
import { NavigationItemComponent } from "./sidebar/navigation-item"
import { CreateOptionComponent } from "./sidebar/create-option"

// Mobile sidebar component
function MobileSidebar() {
  const pathname = usePathname()
  const { isCreateOpen, setIsCreateOpen, dropdownRef } = useSidebar()

  return (
    <div className="flex h-full w-full flex-col bg-white dark:bg-slate-900">
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <SidebarLogo />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4">
        <div className="space-y-2">
          {NAVIGATION_ITEMS.map((item) => (
            <div key={item.name} className="group relative">
              <a
                href={item.href}
                className={cn(
                  "flex items-center gap-3 w-full px-3 py-2 rounded-md transition-colors text-sm",
                  isActiveRoute(pathname, item.href)
                    ? "bg-blue-700 text-white"
                    : "text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </a>
            </div>
          ))}
        </div>
      </nav>

      {/* Create Button + Options */}
      <div className="px-4 pb-4 border-t border-slate-200 dark:border-slate-700 pt-4" ref={dropdownRef}>
        <div className="space-y-2">
          <Button
            size="sm"
            className={cn(
              "w-full justify-start gap-2 transition-colors",
              isCreateOpen
                ? "bg-blue-700 text-white shadow-lg"
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
            )}
            onClick={() => setIsCreateOpen(!isCreateOpen)}
            aria-label="Create new item"
            aria-expanded={isCreateOpen}
          >
            <Plus className={cn("h-4 w-4 transition-transform", isCreateOpen && "rotate-45")} />
            <span>Create New</span>
          </Button>

          {/* Mobile-friendly Create Options */}
          {isCreateOpen && (
            <div className="space-y-1 pl-2">
              {CREATE_OPTIONS.map((option) => (
                <a
                  key={option.name}
                  href={option.href}
                  onClick={() => setIsCreateOpen(false)}
                  className="flex items-center gap-3 w-full px-3 py-2 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-muted-foreground text-sm transition-colors"
                >
                  <option.icon className="h-4 w-4" />
                  <span>{option.name}</span>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Desktop sidebar component (original)
function DesktopSidebar() {
  const pathname = usePathname()
  const { isCreateOpen, setIsCreateOpen, dropdownRef } = useSidebar()

  return (
    <div className="flex h-full w-16 flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700">
      <SidebarLogo />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <div className="space-y-2">
          {NAVIGATION_ITEMS.map((item) => (
            <NavigationItemComponent
              key={item.name}
              item={item}
              isActive={isActiveRoute(pathname, item.href)}
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
                "relative w-10 h-10 p-0 transition-colors",
                isCreateOpen
                  ? "bg-blue-700 text-white shadow-lg"
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
              )}
              onClick={() => setIsCreateOpen(!isCreateOpen)}
              aria-label="Create new item"
              aria-expanded={isCreateOpen}
            >
              <Plus className={cn("h-4 w-4 transition-transform", isCreateOpen && "rotate-45")} />

              <span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-black px-2 py-1 text-sm text-white opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                Create New
              </span>
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
              <CreateOptionComponent key={option.name} option={option} onClose={() => setIsCreateOpen(false)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function SimpleSidebar() {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <>
        {/* Mobile hamburger menu trigger */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="fixed top-4 left-4 z-50 md:hidden h-10 w-10"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation Menu</SheetTitle>
            </SheetHeader>
            <MobileSidebar />
          </SheetContent>
        </Sheet>
        {/* Return empty div for layout purposes */}
        <div className="w-0" />
      </>
    )
  }

  return <DesktopSidebar />
}
