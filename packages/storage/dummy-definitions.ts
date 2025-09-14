// Dummy test definitions for local development
export const dummyDefinitions = [
  {
    id: "dummy-1",
    name: "GitHub Synced Test",
    image: "ubuntu:latest",
    commands: ["echo Synced from GitHub"],
    description: "This is a dummy test definition from GitHub sync.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "dummy-2",
    name: "Another Dummy Test",
    image: "node:18",
    commands: ["node --version"],
    description: "Another dummy test for local dev.",
    createdAt: new Date().toISOString(),
  },
]
