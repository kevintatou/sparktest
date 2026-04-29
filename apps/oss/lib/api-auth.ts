import { NextResponse } from "next/server"

export function requireDemoWriteToken(request: Request) {
  const requiredToken = process.env.SPARKTEST_DEMO_WRITE_TOKEN

  if (!requiredToken) {
    return null
  }

  const authHeader = request.headers.get("authorization")
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : null

  if (token === requiredToken) {
    return null
  }

  return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
}
