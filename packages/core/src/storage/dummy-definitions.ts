import type { Definition } from "../types"

export const dummyDefinitions: Definition[] = [
  {
    id: "def-1",
    name: "Node.js Tests",
    description: "Run Node.js application tests",
    image: "node:18",
    commands: ["npm test"],
    createdAt: "2023-01-01T00:00:00Z",
    source: "https://github.com/example/repo#tests/nodejs.json"
  },
  {
    id: "def-2", 
    name: "Python Tests",
    description: "Run Python unit tests",
    image: "python:3.9",
    commands: ["python -m pytest"],
    createdAt: "2023-01-02T00:00:00Z",
    source: "https://github.com/example/repo#tests/python.json"
  }
]