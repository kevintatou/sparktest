import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SuiteForm } from "@/components/suite-form"

export default function NewSuitePage() {
  return (
    <div className="container py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/suites">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Create Test Suite
          </h1>
          <p className="text-muted-foreground mt-1">
            Group related test definitions into a logical test set
          </p>
        </div>
      </div>
      <div className="max-w-2xl">
        <SuiteForm />
      </div>
    </div>
  )
}
