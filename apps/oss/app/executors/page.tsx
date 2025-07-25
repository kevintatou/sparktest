"use client"

import Link from "next/link"
import { Plus, Cpu, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
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
    } catch (error) {
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
      executor.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      executor.id.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Executors
          </h1>
          <p className="text-muted-foreground mt-1">Manage your reusable test runners</p>
        </div>
        <Button
          asChild
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        >
          <Link href="/executors/new">
            <Plus className="mr-2 h-4 w-4" />
            New Executor
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative w-full max-w-sm">
          <Input
            placeholder="Search executors..."
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

      {filteredExecutors.length === 0 ? (
        <Card className="p-12 text-center bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 border-dashed">
          <div className="flex flex-col items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center">
              <Cpu className="h-8 w-8 text-blue-600 dark:text-blue-400" />
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
                <Button
                  asChild
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
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
              className="group hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border-slate-200 dark:border-slate-700"
            >
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white">
                    <Cpu className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">{executor.name}</h3>
                    <p className="text-sm text-muted-foreground">{executor.image}</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">{executor.description}</p>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Command:</span>
                    <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{executor.command}</code>
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

                  <p className="text-xs text-muted-foreground">Created {formatDistanceToNow(executor.createdAt)}</p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-4 bg-slate-50/50 dark:bg-slate-800/50">
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
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
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
    </div>
  )
}
