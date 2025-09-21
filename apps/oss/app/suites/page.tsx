"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus, Play, Trash2, Layers, Search } from "lucide-react"

import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { GitHubButton } from "@/components/github-button"
import { FloatingCreateButton } from "@/components/floating-create-button"
import { PageTransition } from "@/components/page-transition"
import { formatDistanceToNow } from "@tatou/core"
import type { Suite } from "@tatou/core/types"
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal"
import { useSuites, useDeleteSuite, useRunSuite } from "@/hooks/use-queries"

export default function SuitesPage() {
  const { data: suites = [], isLoading, error } = useSuites()
  const deleteSuiteMutation = useDeleteSuite()
  const runSuiteMutation = useRunSuite()

  const [searchQuery, setSearchQuery] = useState("")
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [suiteToDelete, setSuiteToDelete] = useState<Suite | null>(null)

  const handleDelete = (suite: Suite) => {
    deleteSuiteMutation.mutate(suite.id, {
      onSuccess: () => {
        setDeleteModalOpen(false)
        setSuiteToDelete(null)
      },
    })
  }

  const handleDeleteClick = (suite: Suite) => {
    setSuiteToDelete(suite)
    setDeleteModalOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (suiteToDelete) {
      handleDelete(suiteToDelete)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false)
    setSuiteToDelete(null)
  }

  const handleRunSuite = (suite: Suite) => {
    runSuiteMutation.mutate(suite)
  }

  // Filter suites based on search query
  const filteredSuites = suites.filter(
    (suite: Suite) =>
      suite.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      suite.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      suite.labels?.some((label: string) => label.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset>
        {/* Clean header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center justify-between px-6 group-data-[collapsible=icon]:pl-18">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  placeholder="Search suites..." 
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
                <Link href="/suites/new">
                  <Plus className="h-4 w-4" />
                  New Suite
                </Link>
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 space-y-8 p-6 group-data-[collapsible=icon]:pl-18">
          <PageTransition>
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array(6)
                .fill(null)
                .map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-muted rounded-lg"></div>
                        <div className="flex-1">
                          <div className="h-5 bg-muted rounded w-32 mb-2"></div>
                          <div className="h-4 bg-muted rounded w-16"></div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-10 bg-muted rounded mb-4"></div>
                      <div className="h-16 bg-muted rounded"></div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : error ? (
            <Card className="p-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <Layers className="h-16 w-16 text-destructive" />
                <div>
                  <h3 className="text-lg font-semibold mb-2">Failed to load suites</h3>
                  <p className="text-muted-foreground mb-4">
                    There was an error loading the suites. Please try refreshing the page.
                  </p>
                </div>
              </div>
            </Card>
          ) : filteredSuites.length === 0 ? (
            <Card className="p-12 text-center border-dashed">
              <div className="flex flex-col items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                  <Layers className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    {searchQuery ? "No suites match your search" : "No suites yet"}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery
                      ? "Try adjusting your search terms."
                      : "Create your first suite to group related tests together."}
                  </p>
                  {!searchQuery && (
                    <Button asChild>
                      <Link href="/suites/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Suite
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredSuites.map((suite: Suite) => (
                <Card key={suite.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                        <Layers className="h-5 w-5 text-foreground" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{suite.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {suite.testDefinitionIds.length} tests
                        </p>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">{suite.description}</p>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Execution Mode:</span>
                        <Badge variant="outline" className="capitalize">
                          {suite.executionMode}
                        </Badge>
                      </div>

                      {suite.labels && suite.labels.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {suite.labels.map((label: string) => (
                            <Badge key={label} variant="secondary" className="text-xs">
                              {label}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <p className="text-xs text-muted-foreground">
                        Created {formatDistanceToNow(suite.createdAt)}
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t pt-4">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/suites/edit/${suite.id}`}>Edit</Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteClick(suite)}
                        disabled={deleteSuiteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleRunSuite(suite)}
                      disabled={runSuiteMutation.isPending}
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Run Suite
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

          <DeleteConfirmationModal
            isOpen={deleteModalOpen}
            onClose={handleDeleteCancel}
            onConfirm={handleDeleteConfirm}
            isDeleting={deleteSuiteMutation.isPending}
            title="Delete Suite"
            description="Are you sure you want to delete this suite? This will permanently remove the suite configuration and cannot be undone. Individual test definitions will remain unchanged."
            itemName={suiteToDelete?.name}
            itemType="Suite"
          />
          </PageTransition>
        </main>
      </SidebarInset>
      <FloatingCreateButton />
    </SidebarProvider>
  )
}
