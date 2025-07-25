import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"

import type { Test } from "@tatou/core/types"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate request body
    if (!body.name || !body.image || !Array.isArray(body.command) || body.command.length === 0) {
      return NextResponse.json({ error: "Missing required fields: name, image, command" }, { status: 400 })
    }

    // In a real implementation, this would create a Kubernetes job
    // using the Kubernetes JavaScript client

    // For the MVP, we'll just mock the response
    const newTest: Test = {
      id: uuidv4(),
      name: body.name,
      image: body.image,
      command: body.command,
      status: "running",
      createdAt: new Date().toISOString(),
      // Add the test definition ID if it exists
      testDefinitionId: body.testDefinitionId || undefined,
    }

    // In a real implementation, we would store this in a database

    return NextResponse.json(newTest, { status: 201 })
  } catch (error) {
    console.error("Error creating test:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
