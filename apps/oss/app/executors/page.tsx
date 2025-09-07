"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus, Cpu, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { storage } from "@tatou/storage-service"
import { useToast } from "@/components/ui/use-toast"
import { formatDistanceToNow } from "@tatou/core"
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
      executor.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-8 p-6">
          {/* Simple header */}
          <div>
            <h1 className="text-2xl font-semibold">Executors</h1>
          </div>

          {filteredExecutors.length === 0 ? (
            <Card className="p-12 text-center">
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
                      : "Create your first executor to get started."}
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
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                        <Cpu className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">
                          {executor.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">{executor.id}</p>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge variant="secondary">
                          Active
                        </Badge>
                      </div>

                      <p className="text-xs text-muted-foreground">
                        Created {formatDistanceToNow(executor.createdAt)}
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t pt-4">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/executors/edit/${executor.id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
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
                    <Button size="sm" asChild>
                      <Link href={`/executors/${executor.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      )
    }