import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TestDefinitionForm } from "@/components/test-definition-form"

export default function NewDefinitionPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/definitions">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create Test Definition</h1>
            <p className="text-muted-foreground">Define a reusable test blueprint</p>
          </div>
        </div>
        <div className="max-w-2xl">
          <TestDefinitionForm />
        </div>
      </main>
    </div>
  )
}
