"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Executor } from "@sparktest/core/types"
import { storage } from "@sparktest/storage-service"

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
    env: existingExecutor?.env || {},
    description: existingExecutor?.description || "",
    createdAt: existingExecutor?.createdAt || new Date().toISOString(),
  })

  const handleChange = (key: keyof Executor, value: string | string[] | Record<string, string>) => {
    setFormData({ ...formData, [key]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.image) return
    await storage.saveExecutor(formData as Executor)
    router.push("/executors")
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-white p-6 rounded-lg border max-w-2xl mx-auto shadow-sm"
    >
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
          value={formData.command?.join(", ") || ""}
          onChange={(e) =>
            handleChange(
              "command",
              e.target.value.split(",").map((s) => s.trim())
            )
          }
          placeholder="e.g. run, /scripts/test.js"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Comma-separated. This becomes your container&apos;s command.
        </p>
      </div>

      <div>
        <Label htmlFor="supportedFileTypes">Supported File Types</Label>
        <Input
          id="supportedFileTypes"
          value={formData.supportedFileTypes?.join(", ") || ""}
          onChange={(e) =>
            handleChange(
              "supportedFileTypes",
              e.target.value.split(",").map((s) => s.trim())
            )
          }
          placeholder="e.g. json, js"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Comma-separated file extensions this executor supports.
        </p>
      </div>

      <div>
        <Label htmlFor="env">Environment Variables</Label>
        <Input
          id="env"
          value={Object.entries(formData.env || {}).map(([key, value]) => `${key}=${value}`).join(", ")}
          onChange={(e) => {
            const envEntries = e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
            const envObject: Record<string, string> = {}
            envEntries.forEach((entry) => {
              const [key, value] = entry.split("=")
              if (key && value) {
                envObject[key.trim()] = value.trim()
              }
            })
            handleChange("env", envObject)
          }}
          placeholder="e.g. API_KEY=value1, DB_URL=value2"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Comma-separated variable names to inject into the test container.
        </p>
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
