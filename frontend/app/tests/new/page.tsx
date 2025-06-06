import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { TestDefinitionForm } from "@/components/test-definition-form"

export default function NewTestDefinitionPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">⚡ SparkTest</span>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-6">
          <div className="mx-auto max-w-2xl">
            <div className="flex items-center gap-2 mb-6">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="sr-only">Back</span>
                </Link>
              </Button>
              <h1 className="text-2xl font-bold">Create Test Definition</h1>
            </div>
            <TestDefinitionForm />
          </div>
        </div>
      </main>
    </div>
  )
}
