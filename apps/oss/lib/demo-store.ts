type SupabaseRow = Record<string, any>

const supabaseUrl = process.env.SPARKTEST_SUPABASE_URL
const serviceRoleKey = process.env.SPARKTEST_SUPABASE_SERVICE_ROLE_KEY

export function isDemoStoreEnabled() {
  return Boolean(supabaseUrl && serviceRoleKey)
}

async function supabaseRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase demo store is not configured")
  }

  const headers = new Headers(init.headers)
  headers.set("apikey", serviceRoleKey)
  headers.set("Authorization", `Bearer ${serviceRoleKey}`)

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  const response = await fetch(`${supabaseUrl}/rest/v1${path}`, {
    ...init,
    headers,
    cache: "no-store",
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Supabase request failed (${response.status}): ${body}`)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

function mapDefinition(row: SupabaseRow) {
  return {
    id: row.id,
    name: row.name,
    image: row.image,
    commands: row.commands ?? [],
    description: row.description ?? "",
    createdAt: row.created_at,
    executorId: row.executor_id,
    labels: row.labels ?? [],
  }
}

function mapExecutor(row: SupabaseRow) {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    image: row.image,
    defaultCommand: row.default_command,
    supportedFileTypes: row.supported_file_types ?? [],
    environmentVariables: row.environment_variables ?? [],
    icon: row.icon,
  }
}

function getDemoRunStatus(row: SupabaseRow) {
  if (row.status !== "running") return row.status

  const ageMs = Date.now() - new Date(row.created_at).getTime()
  if (ageMs > 12000) return "succeeded"
  if (ageMs > 5000) return "running"
  return "queued"
}

function getDemoLogs(row: SupabaseRow) {
  const existing = row.logs ?? []
  if (existing.length > 0 && row.status !== "running") return existing

  const command = (row.command ?? []).join(" && ")
  const status = getDemoRunStatus(row)
  const lines = [
    `SparkTest demo run: ${row.name}`,
    `Image: ${row.image}`,
    `Command: ${command}`,
    "Pulling container image...",
    "Starting test container...",
  ]

  if (status === "queued") return lines.slice(0, 3)
  if (status === "running") return [...lines, "Executing test commands..."]

  return [...lines, "Executing test commands...", "Collecting results...", "Demo run completed successfully."]
}

function mapRun(row: SupabaseRow) {
  const status = getDemoRunStatus(row)
  return {
    id: row.id,
    name: row.name,
    image: row.image,
    command: row.command ?? [],
    status,
    createdAt: row.created_at,
    duration: status === "succeeded" ? row.duration ?? 12000 : row.duration,
    logs: getDemoLogs(row),
    testDefinitionId: row.test_definition_id,
    executorId: row.executor_id,
    origin: row.origin ?? "api",
    jobName: `demo-run-${row.id}`,
    jobCreated: false,
  }
}

function mapSuite(row: SupabaseRow) {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    executionMode: row.execution_mode,
    labels: row.labels ?? [],
    testDefinitionIds: row.test_definition_ids ?? [],
    createdAt: row.created_at,
  }
}

export async function listDefinitions() {
  const rows = await supabaseRequest<SupabaseRow[]>(
    "/test_definitions?select=*&order=created_at.desc"
  )
  return rows.map(mapDefinition)
}

export async function getDefinition(id: string) {
  const rows = await supabaseRequest<SupabaseRow[]>(
    `/test_definitions?id=eq.${id}&select=*&limit=1`
  )
  return rows[0] ? mapDefinition(rows[0]) : null
}

export async function createDefinition(body: any) {
  const rows = await supabaseRequest<SupabaseRow[]>("/test_definitions?select=*", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      name: body.name,
      description: body.description ?? "",
      image: body.image,
      commands: body.commands ?? [],
      executor_id: body.executorId ?? null,
      labels: body.labels ?? [],
    }),
  })
  return mapDefinition(rows[0])
}

export async function updateDefinition(id: string, body: any) {
  const rows = await supabaseRequest<SupabaseRow[]>(`/test_definitions?id=eq.${id}&select=*`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      name: body.name,
      description: body.description ?? "",
      image: body.image,
      commands: body.commands ?? [],
      executor_id: body.executorId ?? null,
      labels: body.labels ?? [],
    }),
  })
  return rows[0] ? mapDefinition(rows[0]) : null
}

export async function deleteDefinition(id: string) {
  await supabaseRequest(`/test_definitions?id=eq.${id}`, { method: "DELETE" })
}

export async function listRuns() {
  const rows = await supabaseRequest<SupabaseRow[]>("/test_runs?select=*&order=created_at.desc")
  return rows.map(mapRun)
}

export async function getRun(id: string) {
  const rows = await supabaseRequest<SupabaseRow[]>(`/test_runs?id=eq.${id}&select=*&limit=1`)
  return rows[0] ? mapRun(rows[0]) : null
}

export async function createRun(body: any) {
  const rows = await supabaseRequest<SupabaseRow[]>("/test_runs?select=*", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      name: body.name,
      image: body.image,
      command: body.commands ?? body.command ?? [],
      status: "running",
      logs: [],
      test_definition_id: body.testDefinitionId ?? null,
      executor_id: body.executorId ?? null,
      origin: "api",
    }),
  })
  return mapRun(rows[0])
}

export async function runDefinition(id: string, body: any = {}) {
  const definition = await getDefinition(id)
  if (!definition) return null

  return createRun({
    name: body.name ?? `${definition.name} - Demo Run`,
    image: body.image ?? definition.image,
    commands: body.commands ?? definition.commands,
    testDefinitionId: definition.id,
    executorId: definition.executorId,
  })
}

export async function deleteRun(id: string) {
  await supabaseRequest(`/test_runs?id=eq.${id}`, { method: "DELETE" })
}

export async function listExecutors() {
  const rows = await supabaseRequest<SupabaseRow[]>("/test_executors?select=*&order=name.asc")
  return rows.map(mapExecutor)
}

export async function getExecutor(id: string) {
  const rows = await supabaseRequest<SupabaseRow[]>(`/test_executors?id=eq.${id}&select=*&limit=1`)
  return rows[0] ? mapExecutor(rows[0]) : null
}

export async function listSuites() {
  const rows = await supabaseRequest<SupabaseRow[]>("/test_suites?select=*&order=created_at.desc")
  return rows.map(mapSuite)
}

export async function getSuite(id: string) {
  const rows = await supabaseRequest<SupabaseRow[]>(`/test_suites?id=eq.${id}&select=*&limit=1`)
  return rows[0] ? mapSuite(rows[0]) : null
}

export function getRunLogs(run: any) {
  return {
    job_name: run.jobName ?? `demo-run-${run.id}`,
    pod_name: "sparktest-demo",
    logs: (run.logs ?? []).join("\n"),
    timestamp: new Date().toISOString(),
    status: run.status,
  }
}
