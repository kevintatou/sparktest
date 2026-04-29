import { NextResponse } from "next/server"
import { requireDemoWriteToken } from "@/lib/api-auth"
import { createDefinition, isDemoStoreEnabled, listDefinitions } from "@/lib/demo-store"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080"

export async function GET() {
  try {
    if (isDemoStoreEnabled()) {
      return NextResponse.json(await listDefinitions())
    }

    console.log(`Fetching from: ${BACKEND_URL}/api/test-definitions`)
    const response = await fetch(`${BACKEND_URL}/api/test-definitions`)

    console.log(`Response status: ${response.status}`)
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Backend error: ${response.status} - ${errorText}`)
      throw new Error(`Backend responded with status: ${response.status}`)
    }

    const data = await response.json()
    console.log(`Successfully fetched ${data.length} definitions`)
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching test definitions:", error)
    return NextResponse.json({ error: "Failed to fetch test definitions" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const unauthorized = requireDemoWriteToken(request)
    if (unauthorized) return unauthorized

    const body = await request.json()

    if (isDemoStoreEnabled()) {
      return NextResponse.json(await createDefinition(body), { status: 201 })
    }

    const response = await fetch(`${BACKEND_URL}/api/test-definitions`, {
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
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("Error creating test definition:", error)
    return NextResponse.json({ error: "Failed to create test definition" }, { status: 500 })
  }
}
