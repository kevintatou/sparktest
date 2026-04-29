import { NextResponse } from "next/server"
import { deleteRun, getRun, isDemoStoreEnabled } from "@/lib/demo-store"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    if (isDemoStoreEnabled()) {
      const run = await getRun(params.id)
      if (!run) {
        return NextResponse.json({ error: "Run not found" }, { status: 404 })
      }
      return NextResponse.json(run)
    }

    const response = await fetch(`${BACKEND_URL}/api/test-runs/${params.id}`)

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching test run:", error)
    return NextResponse.json({ error: "Failed to fetch test run" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    if (isDemoStoreEnabled()) {
      await deleteRun(params.id)
      return new NextResponse(null, { status: 204 })
    }

    const response = await fetch(`${BACKEND_URL}/api/test-runs/${params.id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`)
    }

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("Error deleting test run:", error)
    return NextResponse.json({ error: "Failed to delete test run" }, { status: 500 })
  }
}
