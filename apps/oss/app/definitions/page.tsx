"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus, Play, Edit, Trash2, FileText, Github, ExternalLink, Search } from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { storage } from "@tatou/storage-service"
import { useToast } from "@/components/ui/use-toast"
import { formatDistanceToNow } from "@tatou/core"
import type { Definition } from "@tatou/core/types"
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal"

export default function DefinitionsPage() {
  const { toast } = useToast()
  const [definitions, setDefinitions] = useState<Definition[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [definitionToDelete, setDefinitionToDelete] = useState<Definition | null>(null)

  useEffect(() => {
    const loadDefinitions = async () => {
      const defs = await storage.getDefinitions()
      setDefinitions(defs)
    }
    loadDefinitions()
  }, [])

  const handleDelete = async (id: string) => {
    setIsDeleting(id)
    try {
      await storage.deleteDefinition(id)
      const defs = await storage.getDefinitions()
      setDefinitions(defs)
      toast({
        title: "Definition deleted",
        description: "The definition has been removed successfully.",
      })
    } catch {
      toast({
        title: "Error deleting definition",
        description: "Failed to delete the definition.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(null)
      setDeleteModalOpen(false)
      setDefinitionToDelete(null)
    }
  }

  const handleDeleteClick = (definition: Definition) => {
    setDefinitionToDelete(definition)
    setDeleteModalOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (definitionToDelete) {
      handleDelete(definitionToDelete.id)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false)
    setDefinitionToDelete(null)
  }

  const handleRunTest = async (definitionId: string) => {
    try {
      await storage.createRun(definitionId)
      toast({
        title: "Test started",
        description: "Your test run has been created and is starting.",
      })
    } catch {
      toast({
        title: "Error starting test",
        description: "Failed to create the test run.",
        variant: "destructive",
      })
    }
  }

  const filteredDefinitions = definitions.filter(
    (def) =>
      def.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      def.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      def.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <SidebarInset>
        {/* Clean header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search..." className="pl-9 bg-muted/50 border-0 focus-visible:ring-1" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button size="sm" className="gap-2" asChild>
                <Link href="/definitions/new">
                  <Plus className="h-4 w-4" />
                  New Definition
                </Link>
              </Button>
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 space-y-8 p-6">
          {/* Simple header */}
          <div>
            <h1 className="text-2xl font-semibold">Definitions</h1>
          </div>

          {filteredDefinitions.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    {searchQuery ? "No definitions match your search" : "No definitions yet"}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery
                      ? "Try adjusting your search terms."
                      : "Create your first definition to get started."}
                  </p>
                  {!searchQuery && (
                    <Button asChild>
                      <Link href="/definitions/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Definition
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredDefinitions.map((definition) => (
                <Card
                  key={definition.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">
                          {definition.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">{definition.image}</p>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {definition.description}
                    </p>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Commands:</span>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {definition.commands.join(", ")}
                        </code>
                      </div>

                      {definition.executorId && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Executor:</span>
                          <Badge variant="outline" className="text-xs">
                            {definition.executorId}
                          </Badge>
                        </div>
                      )}

                      {definition.source && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Source:</span>
                          <a
                            href={definition.source}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 hover:underline"
                          >
                            <Github className="h-3 w-3" />
                            GitHub
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      )}

                      {definition.labels && definition.labels.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {definition.labels.map((label) => (
                            <Badge key={label} variant="secondary" className="text-xs">
                              {label}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <p className="text-xs text-muted-foreground">
                        Created {formatDistanceToNow(definition.createdAt)}
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t pt-4">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/definitions/edit/${definition.id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteClick(definition)}
                        disabled={isDeleting === definition.id}
                      >
                        {isDeleting === definition.id ? (
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
                      onClick={() => handleRunTest(definition.id)}
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Run
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
            isDeleting={isDeleting === definitionToDelete?.id}
            title="Delete Definition"
            description="Are you sure you want to delete this definition? This will permanently remove the test configuration and cannot be undone."
            itemName={definitionToDelete?.name}
            itemType="Definition"
          />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
