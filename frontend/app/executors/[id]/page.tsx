"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { storage } from "@/lib/storage"
import type { Executor } from "@/lib/types"
import ClientLayout from "@/app/client-layout"


export default function ExecutorDetailsPage({ params }: { params: { id: string } }) {
    const [executor, setExecutor] = useState<Executor | null>(null)

    useEffect(() => {
        const fetchExecutor = async () => {
            const exec = await storage.getExecutorById(params.id)
            setExecutor(exec || null)
        }

        fetchExecutor()
    }, [params.id])

    if (!executor) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <p className="text-muted-foreground">Executor not found.</p>
                <Link href="/executors">← Back to Executors</Link>
            </div>
        )
    }

    return (
        <ClientLayout>
            <div className="flex min-h-screen flex-col">
                <main className="container py-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/executors">
                                <ArrowLeft className="h-4 w-4" />
                                <span className="sr-only">Back</span>
                            </Link>
                        </Button>
                        <h1 className="text-2xl font-bold">{executor.name}</h1>
                    </div>

                    <p><strong>Description:</strong> {executor.description}</p>
                    <p><strong>Image:</strong> {executor.image}</p>
                    <p><strong>Command:</strong> {executor.command}</p>
                    <p><strong>Supported File Types:</strong> {executor.supportedFileTypes?.join(", ")}</p>
                </main>
            </div>
        </ClientLayout>
    )
}
