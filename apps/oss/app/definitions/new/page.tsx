import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DefinitionForm } from "@/components/test-definition-form"

export default function NewDefinitionPage() {
  return (
    <div className="container py-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/definitions">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Create Test Definition</h1>
      </div>
      <DefinitionForm />
    </div>
  )
}
