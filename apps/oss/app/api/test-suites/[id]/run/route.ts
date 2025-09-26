import { NextRequest } from "next/server"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:8080"

    const response = await fetch(`${backendUrl}/api/test-suites/${params.id}/run`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const error = await response.text()
      return Response.json({ error: `Backend error: ${error}` }, { status: response.status })
    }

    const data = await response.json()
    return Response.json(data)
  } catch (error) {
    console.error("Suite run error:", error)
    return Response.json({ error: "Failed to run suite" }, { status: 500 })
  }
}
