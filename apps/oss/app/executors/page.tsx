"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus, Cpu, Edit, Trash2, Search } from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { GitHubButton } from "@/components/github-button"
import { FloatingCreateButton } from "@/components/floating-create-button"
import { useToast } from "@/components/ui/use-toast"
import { formatDistanceToNow } from "@tatou/core"
import { storage } from "@tatou/storage-service"
import type { Executor } from "@tatou/core/types"

export default function ExecutorsPage() {
  const { toast } = useToast()
  const [executors, setExecutors] = useState<Executor[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  useEffect(() => {
    const loadExecutors = async () => {
      const exec = await storage.getExecutors()
      setExecutors(exec)
    }
    loadExecutors()
  }, [])

  const handleDelete = async (id: string) => {
    setIsDeleting(id)
    try {
      await storage.deleteExecutor(id)
      const exec = await storage.getExecutors()
      setExecutors(exec)
      toast({
        title: "Executor deleted",
        description: "The executor has been removed successfully.",
      })
    } catch {
      toast({
        title: "Error deleting executor",
        description: "Failed to delete the executor.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(null)
    }
  }

  const filteredExecutors = executors.filter(
    (executor) =>
      executor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      executor.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      executor.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset>
        {/* Clean header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center justify-between px-6 group-data-[collapsible=icon]:pl-20">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  placeholder="Search executors..." 
                  className="pl-9 bg-muted/50 border-0 focus-visible:ring-1"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <GitHubButton />
              <ThemeToggle />
              <Button size="sm" className="gap-2" asChild>
                <Link href="/executors/new">
                  <Plus className="h-4 w-4" />
                  New Executor
                </Link>
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 space-y-8 p-6 group-data-[collapsible=icon]:pl-20">
          <div>
            <h1 className="text-2xl font-semibold">Executors</h1>
            <p className="text-muted-foreground">Manage your reusable test runners</p>
          </div>

          {filteredExecutors.length === 0 ? (
            <Card className="p-12 text-center border-dashed">
              <div className="flex flex-col items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                  <Cpu className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    {searchQuery ? "No executors match your search" : "No executors yet"}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery
                      ? "Try adjusting your search terms."
                      : "Create your first executor to define reusable test runners."}
                  </p>
                  {!searchQuery && (
                    <Button asChild>
                      <Link href="/executors/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Executor
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredExecutors.map((executor) => (
                <Card
                  key={executor.id}
                  className="group hover:shadow-md transition-shadow"
                >
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white">
                        <Cpu className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{executor.name}</h3>
                        <p className="text-sm text-muted-foreground">{executor.image}</p>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">{executor.description}</p>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Command:</span>
                        <code className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">
                          {executor.command}
                        </code>
                      </div>

                      {executor.supportedFileTypes && executor.supportedFileTypes.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {executor.supportedFileTypes.map((type) => (
                            <Badge key={type} variant="secondary" className="text-xs">
                              {type}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <p className="text-xs text-muted-foreground">
                        Created {formatDistanceToNow(executor.createdAt)}
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t pt-4 bg-muted/50">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/executors/edit/${executor.id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200 dark:text-red-400 dark:hover:bg-red-950 dark:hover:text-red-300"
                        onClick={() => handleDelete(executor.id)}
                        disabled={isDeleting === executor.id}
                      >
                        {isDeleting === executor.id ? (
                          <svg
                            className="h-4 w-4 animate-spin"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/executors/${executor.id}`}>View Details</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </main>
      </SidebarInset>
      <FloatingCreateButton />
    </SidebarProvider>
  )
}
