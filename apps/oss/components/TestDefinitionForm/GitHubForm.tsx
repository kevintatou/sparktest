"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface GitHubFormProps {
  githubUrl: string
  setGithubUrl: (url: string) => void
  githubPath: string
  setGithubPath: (path: string) => void
  isSubmitting: boolean
  handleGithubSubmit: (e: React.FormEvent) => void
}

export function GitHubForm({
  githubUrl,
  setGithubUrl,
  githubPath,
  setGithubPath,
  isSubmitting,
  handleGithubSubmit,
}: GitHubFormProps) {
  const router = useRouter()

  return (
    <form onSubmit={handleGithubSubmit}>
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Import from GitHub</CardTitle>
          <CardDescription>
            Enter a public GitHub repository URL and (optionally) a path to auto-register test definitions from JSON files.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="github-url">GitHub Repo URL</Label>
            <Input
              id="github-url"
              placeholder="https://github.com/yourorg/yourrepo"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              required
              className="transition-all focus-visible:ring-primary"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="github-path">Path (optional)</Label>
            <Input
              id="github-path"
              placeholder="/tests"
              value={githubPath}
              onChange={(e) => setGithubPath(e.target.value)}
              className="transition-all focus-visible:ring-primary"
            />
            <p className="text-sm text-muted-foreground">
              Defaults to <code>/tests</code> if not specified.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" type="button" onClick={() => router.push("/tests")}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || !githubUrl} className="shadow-sm">
            {isSubmitting ? "Syncing..." : "Sync from GitHub"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}