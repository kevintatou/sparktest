import { NextRequest } from "next/server"
import { requireDemoWriteToken } from "@/lib/api-auth"
import { getSuite, isDemoStoreEnabled } from "@/lib/demo-store"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (isDemoStoreEnabled()) {
      const suite = await getSuite(params.id)
      if (!suite) {
        return Response.json({ error: "Suite not found" }, { status: 404 })
      }
      return Response.json(suite)
    }

    const backendUrl = process.env.BACKEND_URL || "http://localhost:8080"

    const response = await fetch(`${backendUrl}/api/test-suites/${params.id}`)

    if (!response.ok) {
      const error = await response.text()
      return Response.json({ error: `Backend error: ${error}` }, { status: response.status })
    }

    const data = await response.json()
    return Response.json(data)
  } catch (error) {
    console.error("Suite fetch error:", error)
    return Response.json({ error: "Failed to fetch suite" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const unauthorized = requireDemoWriteToken(request)
    if (unauthorized) return unauthorized

    const backendUrl = process.env.BACKEND_URL || "http://localhost:8080"

    const response = await fetch(`${backendUrl}/api/test-suites/${params.id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      const error = await response.text()
      return Response.json({ error: `Backend error: ${error}` }, { status: response.status })
    }

    return Response.json({ id: params.id, deleted: true })
  } catch (error) {
    console.error("Suite delete error:", error)
    return Response.json({ error: "Failed to delete suite" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const unauthorized = requireDemoWriteToken(request)
    if (unauthorized) return unauthorized

    const backendUrl = process.env.BACKEND_URL || "http://localhost:8080"
    const body = await request.json()

    const response = await fetch(`${backendUrl}/api/test-suites/${params.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.text()
      return Response.json({ error: `Backend error: ${error}` }, { status: response.status })
    }

    const data = await response.json()
    return Response.json(data)
  } catch (error) {
    console.error("Suite update error:", error)
    return Response.json({ error: "Failed to update suite" }, { status: 500 })
  }
}
