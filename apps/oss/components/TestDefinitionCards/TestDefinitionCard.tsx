import Link from "next/link"
import { Clock, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "@tatou/core/utils"
import { getIconForTest, generateTagsForTest } from "./testUtils"
import type { Definition } from "@tatou/core/types"

interface DefinitionCardProps {
  test: Definition
  isRunning: boolean
  onQuickRun: (testId: string) => void
  onTestWithModal: (test: Definition) => void
}

export function DefinitionCard({
  test,
  isRunning,
  onQuickRun,
  onTestWithModal,
}: DefinitionCardProps) {
  const Icon = getIconForTest(test)
  const tags = generateTagsForTest(test)

  return (
    <Card className="flex flex-col transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div className="flex gap-1">
            {tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
        <CardTitle className="mt-4">{test.name}</CardTitle>
        <CardDescription>{test.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 text-sm text-muted-foreground">
        <div className="space-y-1">
          <p>Image: {test.image}</p>
          <p>Commands: {test.commands.join(", ")}</p>
          <p className="flex items-center gap-1 mt-2">
            <Clock className="h-3 w-3" /> Created: {formatDistanceToNow(test.createdAt)}
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/tests/edit/${test.id}`}>Edit</Link>
          </Button>
          <Button variant="outline" size="sm" onClick={() => onTestWithModal(test)}>
            <Play className="h-3 w-3 mr-1" />
            Test
          </Button>
        </div>
        <Button size="sm" onClick={() => onQuickRun(test.id)} disabled={isRunning}>
          {isRunning ? (
            <>
              <svg
                className="mr-2 h-4 w-4 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Starting...
            </>
          ) : (
            "Run"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
