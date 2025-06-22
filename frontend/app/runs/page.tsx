"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { storage } from "@/lib/storage"
import { useToast } from "@/components/ui/use-toast"
import { formatDistanceToNow } from "@/lib/utils"
import type { Definition } from "@/lib/types"
import { Navbar } from "@/components/ui/navbar"

export default function TestsPage() {
  const { toast } = useToast()
  const [definitions, setDefinitions] = useState<Definition[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const initializedRef = useRef(false)

  // Load test definitions from localStorage
  useEffect(() => {
    if (!initializedRef.current) {
      const load = async () => {
        const defs = await storage.getDefinitions()
        setDefinitions(defs)
      }
      load()
      initializedRef.current = true
    }
  }, [])
  
  const handleDelete = (id: string) => {
    setIsDeleting(id)

    setTimeout(async () => {
      try {
        await storage.deleteDefinition(id)
        const defs = await storage.getDefinitions()
        setDefinitions(defs)
    
        toast({
          title: "Test definition deleted",
          description: "The test definition has been removed successfully.",
        })
      } catch (error) {
        toast({
          title: "Error deleting test definition",
          description: "Failed to delete the test definition.",
          variant: "destructive",
        })
      } finally {
        setIsDeleting(null)
      }
    }, 500)
    
  }

  // Filter test definitions based on search query
  const filteredDefinitions = definitions.filter(
    (def) =>
      def.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      def.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      def.id.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background to-muted/30">
      <Navbar />
      <main className="flex-1">
        <div className="container py-6">
          <div className="flex items-center gap-2 mb-6">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">Test Definitions</h1>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="relative w-full max-w-sm">
              <Input
                placeholder="Search tests..."
                className="pl-10"
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

          {filteredDefinitions.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground mb-4">
                {searchQuery
                  ? "No test definitions match your search query."
                  : "No test definitions yet. Create your first test definition to get started."}
              </p>
              {!searchQuery && (
                <Button asChild>
                  <Link href="/tests/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Test Definition
                  </Link>
                </Button>
              )}
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredDefinitions.map((test) => (
                <Card key={test.id} className="flex flex-col transition-all hover:shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle>{test.name}</CardTitle>
                    <CardDescription>{test.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 text-sm text-muted-foreground">
                    <div className="space-y-1">
                      <p>Image: {test.image}</p>
                      <p>Commands: {test.commands.join(", ")}</p>
                      <p className="flex items-center gap-1 mt-2">
                        <Badge variant="outline" className="text-xs">
                          Created {formatDistanceToNow(test.createdAt)}
                        </Badge>
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t pt-4">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/tests/edit/${test.id}`}>Edit</Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20"
                        onClick={() => handleDelete(test.id)}
                        disabled={isDeleting === test.id}
                      >
                        {isDeleting === test.id ? (
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
                      <Link href={`/tests/run/${test.id}`}>Run</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
