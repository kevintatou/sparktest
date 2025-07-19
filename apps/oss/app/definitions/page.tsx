"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus, Play, Edit, Trash2, FileText, Github, ExternalLink } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { storage } from "@sparktest/core/storage"
import { useToast } from "@/components/ui/use-toast"
import { formatDistanceToNow } from "@sparktest/core/utils"
import type { Definition } from "@sparktest/core/types"
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
        description: "The test definition has been removed successfully.",
      })
    } catch (error) {
      toast({
        title: "Error deleting definition",
        description: "Failed to delete the test definition.",
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
    } catch (error) {
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
      def.id.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Test Definitions
          </h1>
          <p className="text-muted-foreground mt-1">Manage your reusable test blueprints</p>
        </div>
        <Button
          asChild
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        >
          <Link href="/definitions/new">
            <Plus className="mr-2 h-4 w-4" />
            New Definition
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative w-full max-w-sm">
          <Input
            placeholder="Search definitions..."
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

      {filteredDefinitions.length === 0 ? (
        <Card className="p-12 text-center bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 border-dashed">
          <div className="flex flex-col items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center">
              <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery ? "No definitions match your search" : "No test definitions yet"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? "Try adjusting your search terms." : "Create your first test definition to get started."}
              </p>
              {!searchQuery && (
                <Button
                  asChild
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
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
              className="group hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border-slate-200 dark:border-slate-700"
            >
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">{definition.name}</h3>
                    <p className="text-sm text-muted-foreground">{definition.image}</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">{definition.description}</p>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Commands:</span>
                    <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
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

                  <p className="text-xs text-muted-foreground">Created {formatDistanceToNow(definition.createdAt)}</p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-4 bg-slate-50/50 dark:bg-slate-800/50">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/definitions/edit/${definition.id}`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200 dark:text-red-400 dark:hover:bg-red-950 dark:hover:text-red-300"
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
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
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
        title="Delete Test Definition"
        description="Are you sure you want to delete this test definition? This will permanently remove the test configuration and cannot be undone."
        itemName={definitionToDelete?.name}
        itemType="Test Definition"
      />
    </div>
  )
}
