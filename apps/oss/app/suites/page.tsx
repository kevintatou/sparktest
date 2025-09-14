"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus, Play, Trash2, Layers } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Suites
          </h1>
          <p className="text-muted-foreground mt-1">Group related tests into logical test sets</p>
        </div>
        <Button
          asChild
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        >
          <Link href="/suites/new">
            <Plus className="mr-2 h-4 w-4" />
            New Suite
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative w-full max-w-sm">
          <Input
            placeholder="Search suites..."
            className="pl-10 bg-slate-50 dark:bg-slate-800 border-0 focus-visible:ring-1"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array(6)
            .fill(null)
            .map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-32 mb-2"></div>
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
                  <div className="h-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
                </CardContent>
              </Card>
            ))}
        </div>
      ) : error ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <Layers className="h-16 w-16 text-red-500" />
            <div>
              <h3 className="text-lg font-semibold mb-2">Failed to load suites</h3>
              <p className="text-muted-foreground mb-4">
                There was an error loading the suites. Please try refreshing the page.
              </p>
            </div>
          </div>
        </Card>
      ) : filteredSuites.length === 0 ? (
        <Card className="p-12 text-center bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 border-dashed">
          <div className="flex flex-col items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center">
              <Layers className="h-8 w-8 text-blue-600 dark:text-blue-400" />
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
                <Button
                  asChild
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
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
            <Card
              key={suite.id}
              className="group hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border-slate-200 dark:border-slate-700"
            >
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white">
                    <Layers className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                      {suite.name}
                    </h3>
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
              <CardFooter className="flex justify-between border-t pt-4 bg-slate-50/50 dark:bg-slate-800/50">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/suites/edit/${suite.id}`}>Edit</Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200 dark:text-red-400 dark:hover:bg-red-950 dark:hover:text-red-300"
                    onClick={() => handleDeleteClick(suite)}
                    disabled={deleteSuiteMutation.isPending}
                  >
                    {deleteSuiteMutation.isPending && deleteSuiteMutation.variables === suite.id ? (
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
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleRunSuite(suite)}
                  disabled={runSuiteMutation.isPending}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  {runSuiteMutation.isPending && runSuiteMutation.variables?.id === suite.id ? (
                    <>
                      <svg
                        className="mr-2 h-4 w-4 animate-spin"
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
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Starting...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Run Suite
                    </>
                  )}
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
    </div>
  )
}
