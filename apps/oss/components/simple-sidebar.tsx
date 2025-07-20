"use client"

import { usePathname } from "next/navigation"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useSidebar } from "@/hooks/use-sidebar"
import { isActiveRoute } from "@/lib/utils/navigation"
import { NAVIGATION_ITEMS, CREATE_OPTIONS } from "@/lib/navigation"
import { SidebarLogo } from "./sidebar/sidebar-logo"
import { NavigationItemComponent } from "./sidebar/navigation-item"
import { CreateOptionComponent } from "./sidebar/create-option"

export function SimpleSidebar() {
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
