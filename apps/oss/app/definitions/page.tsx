"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Plus, Play, Edit, Trash2, FileText, Github, ExternalLink, Search } from "lucide-react"

import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { GitHubButton } from "@/components/github-button"
import { FloatingCreateButton } from "@/components/floating-create-button"
import { PageTransition } from "@/components/page-transition"
import { useToast } from "@/components/ui/use-toast"
import { formatDistanceToNow } from "@tatou/core"
import type { Definition } from "@tatou/core/types"
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal"

const API_BASE = "/api"

export default function DefinitionsPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [definitions, setDefinitions] = useState<Definition[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [isRunning, setIsRunning] = useState<string | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [definitionToDelete, setDefinitionToDelete] = useState<Definition | null>(null)

  useEffect(() => {
    const loadDefinitions = async () => {
      try {
        const response = await fetch(`${API_BASE}/test-definitions`)
        const defs = await response.json()
        setDefinitions(defs)
      } catch (error) {
        console.error("Failed to load definitions:", error)
        setDefinitions([]) // Show empty state on error
      }
    }
    loadDefinitions()
  }, [])

  const handleDelete = async (id: string) => {
    setIsDeleting(id)
    try {
      await fetch(`${API_BASE}/test-definitions/${id}`, { method: "DELETE" })
      const response = await fetch(`${API_BASE}/test-definitions`)
      const defs = await response.json()
      setDefinitions(defs)
      toast({
        title: "Definition deleted",
        description: "The definition has been removed successfully.",
      })
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete definition.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(null)
    }
  }

  const handleRun = async (definitionId: string) => {
    setIsRunning(definitionId)
    try {
      const definition = definitions.find((d) => d.id === definitionId)
      if (!definition) throw new Error("Definition not found")

      const response = await fetch(`${API_BASE}/test-runs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${definition.name} - Manual Run`,
          image: definition.image,
          commands: definition.commands,
        }),
      })

      const run = await response.json()
      toast({
        title: run.jobCreated ? "🚀 Test run started!" : "⚠️ Run created (K8s issue)",
        description: run.jobCreated
          ? `Kubernetes job created: ${run.jobName}. Run ID: ${run.id}`
          : `Run created but Kubernetes job failed. Run ID: ${run.id}`,
      })
      router.push(`/runs/${run.id}`)
    } catch {
      toast({
        title: "Error",
        description: "Failed to start test run.",
        variant: "destructive",
      })
    } finally {
      setIsRunning(null)
    }
  }

  const handleDeleteClick = (definition: Definition) => {
    setDefinitionToDelete(definition)
    setDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (definitionToDelete) {
      await handleDelete(definitionToDelete.id)
      setDeleteModalOpen(false)
      setDefinitionToDelete(null)
    }
  }

  const filteredDefinitions = definitions.filter(
    (def) =>
      def.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      def.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      def.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset>
        {/* Clean, minimal header */}
        <header className="border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <div className="flex h-14 items-center justify-between px-8 group-data-[collapsible=icon]:pl-20">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  placeholder="Search definitions..."
                  className="pl-9 w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border-0 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-300 focus:outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <GitHubButton />
              <ThemeToggle />
              <Link
                href="/definitions/new"
                className="px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-medium rounded-lg hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                New Definition
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content - Modern spacing and layout */}
        <main className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8 group-data-[collapsible=icon]:pl-20">
          <PageTransition>
            {/* Welcome section */}
            <div className="mb-8">
              <h1 className="text-2xl font-medium text-slate-900 dark:text-slate-100 mb-2">
                Test Definitions
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Manage your test configurations and execution templates
              </p>
            </div>

            {filteredDefinitions.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 p-12 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                    <FileText className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-slate-600 dark:text-slate-300 mb-2">
                      {searchQuery ? "No definitions match your search" : "No definitions yet"}
                    </h3>
                    <p className="text-slate-400 dark:text-slate-500 mb-6">
                      {searchQuery
                        ? "Try adjusting your search terms."
                        : "Create your first definition to get started."}
                    </p>
                    {!searchQuery && (
                      <Link
                        href="/definitions/new"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-medium rounded-lg hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                        Create Definition
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredDefinitions.map((definition) => (
                  <div
                    key={definition.id}
                    className="bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 group"
                  >
                    {/* Card Header */}
                    <div className="p-6 pb-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-slate-900 dark:text-slate-100 truncate">
                            {definition.name}
                          </h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                            {definition.image}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mb-4">
                        {definition.description}
                      </p>
                    </div>

                    {/* Card Content */}
                    <div className="px-6 space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500 dark:text-slate-400">Commands:</span>
                        <code className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-1 rounded max-w-32 truncate">
                          {definition.commands.join(", ")}
                        </code>
                      </div>

                      {definition.executorId && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Executor:</span>
                          <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                            {definition.executorId}
                          </span>
                        </div>
                      )}

                      {definition.source && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Source:</span>
                          <a
                            href={definition.source}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:underline"
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
                            <span
                              key={label}
                              className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full"
                            >
                              {label}
                            </span>
                          ))}
                        </div>
                      )}

                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        Created {formatDistanceToNow(definition.createdAt)}
                      </p>
                    </div>

                    {/* Card Footer */}
                    <div className="flex justify-between items-center p-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex gap-2">
                        <Link
                          href={`/definitions/edit/${definition.id}`}
                          className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(definition)}
                          disabled={isDeleting === definition.id}
                          className="p-2 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-md transition-colors disabled:opacity-50"
                        >
                          {isDeleting === definition.id ? (
                            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      <button
                        onClick={() => handleRun(definition.id)}
                        disabled={isRunning === definition.id}
                        className="px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-medium rounded-lg hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isRunning === definition.id ? (
                          <>
                            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            Starting...
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4" />
                            Run
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </PageTransition>
        </main>
      </SidebarInset>
      <FloatingCreateButton />

      {/* Delete Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false)
          setDefinitionToDelete(null)
        }}
        onConfirm={confirmDelete}
        title="Delete Definition"
        description={`Are you sure you want to delete "${definitionToDelete?.name}"? This action cannot be undone.`}
        isDeleting={isDeleting !== null}
        itemType="definition"
      />
    </SidebarProvider>
  )
}
