import { NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
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
