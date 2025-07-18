import type { Definition } from "../types"

export const sampleDefinitions: Definition[] = [
  {
    id: "sample-1",
    name: "Hello World Test",
    description: "A simple hello world test",
    image: "alpine:latest", 
    commands: ["echo 'Hello World'"],
    createdAt: new Date().toISOString(),
    source: "https://github.com/example/samples#tests/hello-world.json"
  }
]