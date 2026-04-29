import { NextResponse } from "next/server"
import {
  deleteDefinition,
  getDefinition,
  isDemoStoreEnabled,
  updateDefinition,
} from "@/lib/demo-store"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    if (isDemoStoreEnabled()) {
      await deleteDefinition(params.id)
      return new NextResponse(null, { status: 204 })
    }

    const response = await fetch(`${BACKEND_URL}/api/test-definitions/${params.id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`)
    }

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("Error deleting test definition:", error)
    return NextResponse.json({ error: "Failed to delete test definition" }, { status: 500 })
  }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    if (isDemoStoreEnabled()) {
      const definition = await getDefinition(params.id)
      if (!definition) {
        return NextResponse.json({ error: "Definition not found" }, { status: 404 })
      }
      return NextResponse.json(definition)
    }

    const response = await fetch(`${BACKEND_URL}/api/test-definitions/${params.id}`)

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching test definition:", error)
    return NextResponse.json({ error: "Failed to fetch test definition" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()

    if (isDemoStoreEnabled()) {
      const definition = await updateDefinition(params.id, body)
      if (!definition) {
        return NextResponse.json({ error: "Definition not found" }, { status: 404 })
      }
      return NextResponse.json(definition)
    }

    const response = await fetch(`${BACKEND_URL}/api/test-definitions/${params.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error updating test definition:", error)
    return NextResponse.json({ error: "Failed to update test definition" }, { status: 500 })
  }
}
