"use client"

import Link from "next/link"
import { Zap, Code, Users, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Navbar() {
  return (
    <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <Zap className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">SparkTest</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/executors">
              <Code className="h-4 w-4 mr-1" />
              Executors
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/suites">
              <Users className="h-4 w-4 mr-1" />
              Suites
            </Link>
          </Button>
          <Button asChild variant="default" className="gap-1 shadow-sm">
            <Link href="/new">
              <Plus className="h-4 w-4" />
              Create Test
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
