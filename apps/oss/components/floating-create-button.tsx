"use client"

import * as React from "react"
import { Plus, FileText, Layers, Network } from "lucide-react"
import { useOptimizedNavigation } from "@/hooks/use-optimized-navigation"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const createRoutes = [
  {
    href: "/definitions/new",
    icon: FileText,
    label: "Test Definition",
  },
  {
    href: "/suites/new", 
    icon: Layers,
    label: "Test Suite",
  },
  {
    href: "/executors/new",
    icon: Network,
    label: "Executor",
  },
]

export function FloatingCreateButton() {
  const { navigate, preload } = useOptimizedNavigation()

  // Preload all create routes on mount for faster navigation
  React.useEffect(() => {
    createRoutes.forEach(route => preload(route.href))
  }, [preload])

  const handleItemClick = (href: string) => {
    navigate(href)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="h-14 w-14 rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center justify-center">
            <Plus className="h-6 w-6" />
            <span className="sr-only">Create new</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="center" 
          side="top" 
          sideOffset={8}
          alignOffset={0}
          className="w-52 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 shadow-2xl rounded-xl p-2 animate-in slide-in-from-bottom-2 duration-200"
        >
          {createRoutes.map((item) => (
            <DropdownMenuItem 
              key={item.href}
              className="cursor-pointer rounded-lg h-12 px-3 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center text-slate-900 dark:text-slate-100"
              onClick={() => handleItemClick(item.href)}
              onMouseEnter={() => preload(item.href)} // Preload on hover for extra speed
            >
              <item.icon className="mr-3 h-4 w-4 text-slate-500 dark:text-slate-400" />
              {item.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
