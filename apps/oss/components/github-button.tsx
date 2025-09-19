"use client"

import { Github } from "lucide-react"
import { Button } from "@/components/ui/button"

export function GitHubButton() {
  const handleGitHubClick = () => {
    window.open("https://github.com/your-org/sparktest", "_blank", "noopener,noreferrer")
  }

  return (
    <Button variant="outline" size="icon" onClick={handleGitHubClick}>
      <Github className="h-[1.2rem] w-[1.2rem]" />
      <span className="sr-only">View on GitHub</span>
    </Button>
  )
}
