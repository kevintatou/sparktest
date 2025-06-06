"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Server, AlertCircle, CheckCircle, RefreshCw, Activity } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getKubernetesInfo } from "@/lib/api-service"
import { ClusterTestModal } from "@/components/cluster-test-modal"

export default function ClusterPage() {
  const [clusterInfo, setClusterInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [testModalOpen, setTestModalOpen] = useState(false)

  useEffect(() => {
    const fetchClusterInfo = async () => {
      try {
        const info = await getKubernetesInfo()
        setClusterInfo(info)
      } catch (error) {
        console.error("Error fetching cluster info:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchClusterInfo()
  }, [])

  const refreshClusterInfo = async () => {
    setLoading(true)
    try {
      const info = await getKubernetesInfo()
      setClusterInfo(info)
    } catch (error) {
      console.error("Error refreshing cluster info:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading cluster information...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background to-muted/30">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
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
            <h1 className="text-2xl font-bold">Kubernetes Cluster</h1>
            <div className="flex gap-2 ml-auto">
              <Button variant="outline" size="sm" onClick={() => setTestModalOpen(true)}>
                <Activity className="h-4 w-4 mr-2" />
                Health Check
              </Button>
              <Button variant="outline" size="sm" onClick={refreshClusterInfo} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5 text-primary" />
                  Cluster Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {clusterInfo?.connected ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-green-500">Connected</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-5 w-5 text-red-500" />
                      <span className="text-red-500">Disconnected</span>
                    </>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-2">Version: {clusterInfo?.version || "Unknown"}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Nodes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{clusterInfo?.nodes || 0}</div>
                <p className="text-sm text-muted-foreground">Active nodes</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Pods</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{clusterInfo?.pods || 0}</div>
                <p className="text-sm text-muted-foreground">Running pods</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="nodes">Nodes</TabsTrigger>
              <TabsTrigger value="namespaces">Namespaces</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Cluster Information</CardTitle>
                  <CardDescription>Basic cluster details and configuration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h3 className="font-medium">Kubernetes Version</h3>
                      <p className="text-muted-foreground">{clusterInfo?.version}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Namespace</h3>
                      <p className="text-muted-foreground">{clusterInfo?.namespace}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">API Server</h3>
                      <Badge variant="outline">Healthy</Badge>
                    </div>
                    <div>
                      <h3 className="font-medium">DNS</h3>
                      <Badge variant="outline">Healthy</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="nodes" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Node Status</CardTitle>
                  <CardDescription>Information about cluster nodes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Array.from({ length: clusterInfo?.nodes || 3 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">node-{i + 1}</h4>
                          <p className="text-sm text-muted-foreground">Ready • 4 CPU • 16GB RAM</p>
                        </div>
                        <Badge variant="outline">Ready</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="namespaces" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Namespaces</CardTitle>
                  <CardDescription>Available namespaces in the cluster</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {["default", "kube-system", "sparktest", "monitoring"].map((ns) => (
                      <div key={ns} className="flex items-center justify-between p-3 border rounded-lg">
                        <span className="font-medium">{ns}</span>
                        <Badge variant="outline">Active</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="resources" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Resource Usage</CardTitle>
                  <CardDescription>Cluster resource consumption</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>CPU Usage</span>
                        <span>45%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: "45%" }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Memory Usage</span>
                        <span>62%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: "62%" }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Storage Usage</span>
                        <span>28%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: "28%" }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <ClusterTestModal isOpen={testModalOpen} onClose={() => setTestModalOpen(false)} />
    </div>
  )
}
