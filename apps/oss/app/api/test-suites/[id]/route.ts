import { NextRequest } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
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
    const backendUrl = process.env.BACKEND_URL || "http://localhost:8080"

    const response = await fetch(`${backendUrl}/api/test-suites/${params.id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      const error = await response.text()
      return Response.json({ error: `Backend error: ${error}` }, { status: response.status })
    }

    const data = await response.json()
    return Response.json(data)
  } catch (error) {
    console.error("Suite delete error:", error)
    return Response.json({ error: "Failed to delete suite" }, { status: 500 })
  }
}
