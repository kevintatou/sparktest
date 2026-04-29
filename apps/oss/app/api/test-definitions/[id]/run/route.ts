import { NextResponse } from "next/server"
import { requireDemoWriteToken } from "@/lib/api-auth"
import { isDemoStoreEnabled, runDefinition } from "@/lib/demo-store"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const unauthorized = requireDemoWriteToken(request)
    if (unauthorized) return unauthorized

    const body = await request.json()

    if (isDemoStoreEnabled()) {
      const run = await runDefinition(params.id, body)
      if (!run) {
        return NextResponse.json({ error: "Definition not found" }, { status: 404 })
      }
      return NextResponse.json(run, { status: 201 })
    }

    const response = await fetch(`${BACKEND_URL}/api/test-definitions/${params.id}/run`, {
      method: "POST",
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
    console.error("Error running test:", error)
    return NextResponse.json({ error: "Failed to run test" }, { status: 500 })
  }
}
