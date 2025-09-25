import { NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080"

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/test-suites`)
    
    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`)
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching test suites:", error)
    return NextResponse.json(
      { error: "Failed to fetch test suites" },
      { status: 500 }
    )
  }
}