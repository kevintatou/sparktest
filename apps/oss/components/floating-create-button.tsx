"use client"

import * as React from "react"
import { Plus, FileText, Layers, Network } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function FloatingCreateButton() {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow"
          >
            <Plus className="h-6 w-6" />
            <span className="sr-only">Create new</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" side="top" className="w-56">
          <Link href="/definitions/new">
            <DropdownMenuItem className="cursor-pointer">
              <FileText className="mr-2 h-4 w-4" />
              New Test Definition
            </DropdownMenuItem>
          </Link>
          <Link href="/suites/new">
            <DropdownMenuItem className="cursor-pointer">
              <Layers className="mr-2 h-4 w-4" />
              New Test Suite
            </DropdownMenuItem>
          </Link>
          <Link href="/executors/new">
            <DropdownMenuItem className="cursor-pointer">
              <Network className="mr-2 h-4 w-4" />
              New Executor
            </DropdownMenuItem>
          </Link>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
