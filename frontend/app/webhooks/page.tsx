"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { ArrowLeft, Plus, Trash2, Webhook, Bell, Slack, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { formatDistanceToNow } from "@/lib/utils"
import { TestWebhookModal } from "@/components/test-webhook-modal"

interface WebhookConfig {
  id: string
  name: string
  url: string
  type: "slack" | "teams" | "discord" | "email" | "custom"
  events: string[]
  enabled: boolean
  createdAt: string
}

export default function WebhooksPage() {
  const { toast } = useToast()
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const initializedRef = useRef(false)

  const [testingWebhook, setTestingWebhook] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<
    Record<string, { success: boolean; message: string; timestamp: string }>
  >({})

  const [testModalOpen, setTestModalOpen] = useState(false)
  const [selectedWebhook, setSelectedWebhook] = useState<WebhookConfig | null>(null)

  // Mock webhooks data
  useEffect(() => {
    if (!initializedRef.current) {
      const mockWebhooks: WebhookConfig[] = [
        {
          id: "slack-webhook",
          name: "Slack Notifications",
          url: "https://hooks.slack.com/services/...",
          type: "slack",
          events: ["test.completed", "test.failed"],
          enabled: true,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: "teams-webhook",
          name: "Teams Alerts",
          url: "https://outlook.office.com/webhook/...",
          type: "teams",
          events: ["test.failed", "suite.completed"],
          enabled: false,
          createdAt: new Date(Date.now() - 172800000).toISOString(),
        },
        {
          id: "custom-webhook",
          name: "CI/CD Pipeline",
          url: "https://api.example.com/webhooks/sparktest",
          type: "custom",
          events: ["test.completed", "test.failed", "suite.completed"],
          enabled: true,
          createdAt: new Date(Date.now() - 259200000).toISOString(),
        },
      ]
      setWebhooks(mockWebhooks)
      initializedRef.current = true
    }
  }, [])

  const handleDelete = (id: string) => {
    setIsDeleting(id)

    setTimeout(() => {
      setWebhooks((prev) => prev.filter((webhook) => webhook.id !== id))
      setIsDeleting(null)

      toast({
        title: "Webhook deleted",
        description: "The webhook has been removed successfully.",
      })
    }, 500)
  }

  const handleToggle = (id: string) => {
    setWebhooks((prev) =>
      prev.map((webhook) => (webhook.id === id ? { ...webhook, enabled: !webhook.enabled } : webhook)),
    )

    toast({
      title: "Webhook updated",
      description: "Webhook status has been changed.",
    })
  }

  const getWebhookIcon = (type: string) => {
    switch (type) {
      case "slack":
        return <Slack className="h-5 w-5 text-purple-500" />
      case "teams":
        return <Bell className="h-5 w-5 text-blue-500" />
      case "email":
        return <Mail className="h-5 w-5 text-green-500" />
      default:
        return <Webhook className="h-5 w-5 text-gray-500" />
    }
  }

  // Filter webhooks based on search query
  const filteredWebhooks = webhooks.filter(
    (webhook) =>
      webhook.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      webhook.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      webhook.url.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleTestWebhook = (webhook: WebhookConfig) => {
    setSelectedWebhook(webhook)
    setTestModalOpen(true)
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background to-muted/30">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">⚡ SparkTest</span>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-6">
          <div className="flex items-center gap-2 mb-6">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">Webhooks & Notifications</h1>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="relative w-full max-w-sm">
              <Input
                placeholder="Search webhooks..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <Button asChild className="shadow-sm">
              <Link href="/webhooks/new">
                <Plus className="mr-2 h-4 w-4" />
                New Webhook
              </Link>
            </Button>
          </div>

          {filteredWebhooks.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground mb-4">
                {searchQuery
                  ? "No webhooks match your search query."
                  : "No webhooks configured yet. Set up notifications to stay informed about test results."}
              </p>
              {!searchQuery && (
                <Button asChild>
                  <Link href="/webhooks/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Webhook
                  </Link>
                </Button>
              )}
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredWebhooks.map((webhook) => (
                <Card key={webhook.id} className="flex flex-col transition-all hover:shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2">
                      {getWebhookIcon(webhook.type)}
                      {webhook.name}
                      <Badge variant={webhook.enabled ? "default" : "secondary"}>
                        {webhook.enabled ? "Active" : "Disabled"}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="break-all">{webhook.url}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 text-sm text-muted-foreground">
                    <div className="space-y-3">
                      <div>
                        <p className="font-medium text-foreground">Events:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {webhook.events.map((event) => (
                            <Badge key={event} variant="outline" className="text-xs">
                              {event}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`webhook-${webhook.id}`}
                          checked={webhook.enabled}
                          onCheckedChange={() => handleToggle(webhook.id)}
                        />
                        <Label htmlFor={`webhook-${webhook.id}`} className="text-xs">
                          {webhook.enabled ? "Enabled" : "Disabled"}
                        </Label>
                      </div>

                      <p className="text-xs">Created {formatDistanceToNow(webhook.createdAt)}</p>
                      {testResults[webhook.id] && (
                        <div
                          className={`mt-2 p-2 rounded text-xs ${
                            testResults[webhook.id].success
                              ? "bg-green-50 text-green-700 border border-green-200"
                              : "bg-red-50 text-red-700 border border-red-200"
                          }`}
                        >
                          <p className="font-medium">
                            {testResults[webhook.id].success ? "✓ Test Successful" : "✗ Test Failed"}
                          </p>
                          <p>{testResults[webhook.id].message}</p>
                          <p className="text-xs opacity-75 mt-1">
                            {formatDistanceToNow(testResults[webhook.id].timestamp)}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t pt-4">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/webhooks/edit/${webhook.id}`}>Edit</Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20"
                        onClick={() => handleDelete(webhook.id)}
                        disabled={isDeleting === webhook.id}
                      >
                        {isDeleting === webhook.id ? (
                          <svg
                            className="h-4 w-4 animate-spin"
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
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleTestWebhook(webhook)}>
                      Test
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
          {selectedWebhook && (
            <TestWebhookModal
              isOpen={testModalOpen}
              onClose={() => {
                setTestModalOpen(false)
                setSelectedWebhook(null)
              }}
              webhook={selectedWebhook}
            />
          )}
        </div>
      </main>
    </div>
  )
}
