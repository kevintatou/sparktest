import { NextResponse } from "next/server"
import { requireDemoWriteToken } from "@/lib/api-auth"
import { createRun, isDemoStoreEnabled, listRuns } from "@/lib/demo-store"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080"

export async function GET() {
  try {
    if (isDemoStoreEnabled()) {
      return NextResponse.json(await listRuns())
    }

    const response = await fetch(`${BACKEND_URL}/api/test-runs`)

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching test runs:", error)
    return NextResponse.json({ error: "Failed to fetch test runs" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const unauthorized = requireDemoWriteToken(request)
    if (unauthorized) return unauthorized

    const body = await request.json()

    if (isDemoStoreEnabled()) {
      return NextResponse.json(await createRun(body), { status: 201 })
    }

    const response = await fetch(`${BACKEND_URL}/api/test-runs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Backend error: ${response.status} - ${errorText}`)
      throw new Error(`Backend responded with status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("Error creating test run:", error)
    return NextResponse.json({ error: "Failed to create test run" }, { status: 500 })
  }
}
