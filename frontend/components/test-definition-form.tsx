"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { storage } from "@/lib/storage"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

export function TestDefinitionForm({ existingTest }: { existingTest?: any }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tab, setTab] = useState("manual")
  const [formData, setFormData] = useState({
    name: existingTest?.name || "",
    description: existingTest?.description || "",
    image: existingTest?.image || "",
    commands: existingTest?.commands || [""],
  })
  const [githubUrl, setGithubUrl] = useState("")
  const [githubPath, setGithubPath] = useState("/tests")

  const addCommand = () => {
    setFormData((prev) => ({
      ...prev,
      commands: [...prev.commands, ""],
    }))
  }

  const removeCommand = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      commands: prev.commands.filter((_, i) => i !== index),
    }))
  }

  const updateCommand = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      commands: prev.commands.map((cmd, i) => (i === index ? value : cmd)),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Save to localStorage
      const definitionToSave = existingTest 
        ? {
            ...formData,
            id: existingTest.id,
            commands: formData.commands.filter(Boolean),
            createdAt: existingTest.createdAt,
          }
        : {
            ...formData,
            commands: formData.commands.filter(Boolean),
            createdAt: new Date().toISOString(),
          };
      
      await storage.saveDefinition(definitionToSave);

      toast({
        title: existingTest ? "Test definition updated" : "Test definition created",
        description: `Test "${formData.name}" has been ${existingTest ? "updated" : "created"} successfully.`,
      })

      router.push("/definitions")
    } catch (error) {
      console.error("Error saving definition:", error);
      toast({
        title: `Error ${existingTest ? "updating" : "creating"} test definition`,
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGithubSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      // Here you would call your backend API to trigger a sync for this repo
      // For now, just show a toast
      toast({
        title: "GitHub Sync Triggered",
        description: `Syncing definitions from ${githubUrl}${githubPath}`,
      })
      router.push("/definitions")
    } catch (error) {
      toast({
        title: "Error syncing from GitHub",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Tabs value={tab} onValueChange={setTab} className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="manual">Manual Entry</TabsTrigger>
        <TabsTrigger value="github">Git-backed (GitHub)</TabsTrigger>
      </TabsList>
      <TabsContent value="manual">
        <form onSubmit={handleSubmit}>
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>{existingTest ? "Edit" : "Create"} Test Definition</CardTitle>
              <CardDescription>
                {existingTest
                  ? "Update this test definition"
                  : "Create a reusable test definition that can be executed on demand or scheduled."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Test Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., API Integration Tests"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="transition-all focus-visible:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what this test does..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="transition-all focus-visible:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Container Image</Label>
                <Input
                  id="image"
                  placeholder="e.g., node:18-alpine"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  required
                  className="transition-all focus-visible:ring-primary"
                />
                <p className="text-sm text-muted-foreground">
                  The Docker image that contains your test code and dependencies
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Commands</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addCommand}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Command
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.commands.map((command, index) => (
                    <div key={index} className="flex gap-2 animate-in fade-in-50">
                      <Input
                        placeholder={`e.g., npm test${index > 0 ? ` (command ${index + 1})` : ""}`}
                        value={command}
                        onChange={(e) => updateCommand(index, e.target.value)}
                        required={index === 0}
                        className="transition-all focus-visible:ring-primary"
                      />
                      {index > 0 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeCommand(index)}
                          className="hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Remove command</span>
                        </Button>
                      )}
                    </div>
                  ))}
                  <p className="text-sm text-muted-foreground">
                    Commands will be executed in sequence. First command is required.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" type="button" onClick={() => router.push("/tests")}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="shadow-sm">
                {isSubmitting ? (
                  <>
                    <svg
                      className="mr-2 h-4 w-4 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    {existingTest ? "Updating..." : "Creating..."}
                  </>
                ) : existingTest ? (
                  "Update Test Definition"
                ) : (
                  "Create Test Definition"
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </TabsContent>
      <TabsContent value="github">
        <form onSubmit={handleGithubSubmit}>
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Import from GitHub</CardTitle>
              <CardDescription>
                Enter a public GitHub repository URL and (optionally) a path to auto-register test definitions from JSON files.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="github-url">GitHub Repo URL</Label>
                <Input
                  id="github-url"
                  placeholder="https://github.com/yourorg/yourrepo"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  required
                  className="transition-all focus-visible:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="github-path">Path (optional)</Label>
                <Input
                  id="github-path"
                  placeholder="/tests"
                  value={githubPath}
                  onChange={(e) => setGithubPath(e.target.value)}
                  className="transition-all focus-visible:ring-primary"
                />
                <p className="text-sm text-muted-foreground">
                  Defaults to <code>/tests</code> if not specified.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" type="button" onClick={() => router.push("/tests")}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !githubUrl} className="shadow-sm">
                {isSubmitting ? "Syncing..." : "Sync from GitHub"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </TabsContent>
    </Tabs>
  )
}
