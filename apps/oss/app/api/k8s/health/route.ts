import { NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080"

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/k8s/health`)

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error checking Kubernetes health:", error)
    return NextResponse.json(
      { kubernetes_connected: false, timestamp: new Date().toISOString() },
      { status: 200 } // Return 200 but with disconnected status
    )
  }
}
