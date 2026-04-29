import { NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/test-executors/${params.id}`)

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching test executor:", error)
    return NextResponse.json({ error: "Failed to fetch test executor" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const response = await fetch(`${BACKEND_URL}/api/test-executors/${params.id}`, {
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
    console.error("Error updating test executor:", error)
    return NextResponse.json({ error: "Failed to update test executor" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/test-executors/${params.id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`)
    }

    return NextResponse.json({ id: params.id, deleted: true })
  } catch (error) {
    console.error("Error deleting test executor:", error)
    return NextResponse.json({ error: "Failed to delete test executor" }, { status: 500 })
  }
}
