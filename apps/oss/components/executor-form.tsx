"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Executor } from "@sparktest/core/types"
import { storage } from "@sparktest/core/storage"

interface ExecutorFormProps {
  existingExecutor?: Executor
}

export function ExecutorForm({ existingExecutor }: ExecutorFormProps) {
  const router = useRouter()
  const isEditMode = !!existingExecutor

  const [formData, setFormData] = useState<Omit<Executor, "id"> & Partial<Pick<Executor, "id">>>({
    id: existingExecutor?.id,
    name: existingExecutor?.name || "",
    image: existingExecutor?.image || "",
    command: existingExecutor?.command || [],
    supportedFileTypes: existingExecutor?.supportedFileTypes || [],
    envVars: existingExecutor?.envVars || [],
    description: existingExecutor?.description || "",
  })

  const handleChange = (key: keyof Executor, value: string | string[]) => {
    setFormData({ ...formData, [key]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.image) return
    await storage.saveExecutor(formData as Executor)
    router.push("/executors")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg border max-w-2xl mx-auto shadow-sm">
      {isEditMode && (
        <div>
          <Label>ID</Label>
          <Input value={formData.id} disabled />
        </div>
      )}

      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          required
          placeholder="e.g. Postman or K6"
        />
      </div>

      <div>
        <Label htmlFor="image">Docker Image</Label>
        <Input
          id="image"
          value={formData.image}
          onChange={(e) => handleChange("image", e.target.value)}
          required
          placeholder="e.g. postman/newman"
        />
      </div>

      <div>
        <Label htmlFor="command">Default Command</Label>
        <Input
          id="command"
          value={formData.command.join(", ")}
          onChange={(e) =>
            handleChange("command", e.target.value.split(",").map((s) => s.trim()))
          }
          placeholder="e.g. run, /scripts/test.js"
        />
        <p className="text-xs text-muted-foreground mt-1">Comma-separated. This becomes your container&apos;s command.</p>
      </div>

      <div>
        <Label htmlFor="supportedFileTypes">Supported File Types</Label>
        <Input
          id="supportedFileTypes"
          value={formData.supportedFileTypes.join(", ")}
          onChange={(e) =>
            handleChange("supportedFileTypes", e.target.value.split(",").map((s) => s.trim()))
          }
          placeholder="e.g. json, js"
        />
        <p className="text-xs text-muted-foreground mt-1">Comma-separated file extensions this executor supports.</p>
      </div>

      <div>
        <Label htmlFor="envVars">Environment Variables</Label>
        <Input
          id="envVars"
          value={formData.envVars.join(", ")}
          onChange={(e) =>
            handleChange("envVars", e.target.value.split(",").map((s) => s.trim()))
          }
          placeholder="e.g. API_KEY, DB_URL"
        />
        <p className="text-xs text-muted-foreground mt-1">Comma-separated variable names to inject into the test container.</p>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="What does this executor do?"
        />
      </div>

      <Button type="submit" className="w-full">
        {isEditMode ? "Update Executor" : "Create Executor"}
      </Button>
    </form>
  )
}
