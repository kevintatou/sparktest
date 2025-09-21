"use client"

import * as React from "react"
import { Plus, FileText, Layers, Network } from "lucide-react"
import Link from "next/link"
import { useOptimizedNavigation } from "@/hooks/use-optimized-navigation"

import { Button } from "@/components/ui/button"
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
          <Button
            size="icon"
            className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="h-6 w-6" />
            <span className="sr-only">Create new</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="center" 
          side="top" 
          sideOffset={8}
          alignOffset={0}
          className="w-52 bg-background/95 backdrop-blur-md border-0 shadow-2xl rounded-xl p-3 animate-in slide-in-from-bottom-2 duration-200"
        >
          {createRoutes.map((item) => (
            <DropdownMenuItem 
              key={item.href}
              className="cursor-pointer rounded-lg h-14 px-4 text-base font-medium hover:bg-muted/50 transition-colors"
              onClick={() => handleItemClick(item.href)}
              onMouseEnter={() => preload(item.href)} // Preload on hover for extra speed
            >
              <item.icon className="mr-4 h-5 w-5 text-muted-foreground" />
              {item.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
