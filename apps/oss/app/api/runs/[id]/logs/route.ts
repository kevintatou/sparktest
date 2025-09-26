import { NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // First, get the run to extract the k8s job name
    const runResponse = await fetch(`${BACKEND_URL}/api/test-runs/${params.id}`)

    if (!runResponse.ok) {
      throw new Error(`Failed to fetch run: ${runResponse.statusText}`)
    }

    const run = await runResponse.json()
    
    // Check if the run has a k8s job name
    if (!run.k8sJobName) {
      return NextResponse.json(
        { error: "No Kubernetes job associated with this run" },
        { status: 404 }
      )
    }

    // Fetch logs from the k8s logs endpoint
    const logsResponse = await fetch(`${BACKEND_URL}/api/k8s/logs/${run.k8sJobName}`)

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