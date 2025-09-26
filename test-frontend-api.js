// Simple test script to verify frontend-backend integration
const API_BASE = "http://localhost:8080/api"

async function testGetDefinitions() {
  console.log("Testing GET /test-definitions...")
  try {
    const response = await fetch(`${API_BASE}/test-definitions`)
    const definitions = await response.json()
    console.log(`✅ Found ${definitions.length} definitions`)
    return definitions[0] // Return first definition for testing
  } catch (error) {
    console.error("❌ Failed to fetch definitions:", error)
    return null
  }
}

async function testCreateRun(definition) {
  console.log("Testing POST /test-runs...")
  try {
    const response = await fetch(`${API_BASE}/test-runs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: `${definition.name} - Test Script Run`,
        image: definition.image,
        commands: definition.commands,
      }),
    })

    const run = await response.json()
    console.log(`✅ Created run: ${run.id}`)
    console.log(`🚀 Kubernetes job created: ${run.jobCreated}`)
    console.log(`📋 Job name: ${run.jobName}`)
    return run
  } catch (error) {
    console.error("❌ Failed to create run:", error)
    return null
  }
}

// Run the test
;(async () => {
  console.log("🧪 Testing frontend-backend integration...\n")

  const definition = await testGetDefinitions()
  if (definition) {
    console.log(`📝 Using definition: ${definition.name}\n`)

    const run = await testCreateRun(definition)
    if (run) {
      console.log("\n🎉 All tests passed!")
      console.log(`✅ Frontend can fetch definitions`)
      console.log(`✅ Frontend can create test runs`)
      console.log(`✅ Backend creates Kubernetes jobs: ${run.jobCreated}`)
    }
  }
})()
