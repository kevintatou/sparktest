import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ExecutorForm } from "@/components/executor-form"
import ClientLayout from "@/app/client-layout"

export default function NewExecutorPage() {
    return (
        <ClientLayout>
            <div className="flex min-h-screen flex-col">
                <main className="flex-1 container py-6 max-w-2xl mx-auto">
                    <div className="flex items-center gap-2 mb-6">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/executors">
                                <ArrowLeft className="h-4 w-4" />
                                <span className="sr-only">Back</span>
                            </Link>
                        </Button>
                        <h1 className="text-2xl font-bold">Create Executor</h1>
                    </div>
                    <ExecutorForm />
                </main>
            </div>
        </ClientLayout>
    )
}
