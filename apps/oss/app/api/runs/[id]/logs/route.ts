import { NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // First, get the run to verify it exists
    const runResponse = await fetch(`${BACKEND_URL}/api/test-runs/${params.id}`)

    if (!runResponse.ok) {
      throw new Error(`Failed to fetch run: ${runResponse.statusText}`)
    }
    
    // Reconstruct the k8s job name using the same pattern as the backend
    // Backend creates job names as: format!("test-run-{run_uuid}")
    const k8sJobName = `test-run-${params.id}`

    // Fetch logs from the k8s logs endpoint using the reconstructed job name
    const logsResponse = await fetch(`${BACKEND_URL}/api/k8s/logs/${k8sJobName}`)

    if (!logsResponse.ok) {
      throw new Error(`Failed to fetch logs: ${logsResponse.statusText}`)
    }

    const logsData = await logsResponse.json()
    return NextResponse.json(logsData)
  } catch (error) {
    console.error("Error fetching run logs:", error)
    return NextResponse.json(
      { error: "Failed to fetch run logs" },
      { status: 500 }
    )
  }
}