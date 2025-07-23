"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Plus, Settings, Shield, Database, Network } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default function AdvancedTestsPage() {
  const [testConfig, setTestConfig] = useState({
    enableNetworkPolicies: false,
    enableRBAC: false,
    enableResourceQuotas: false,
    enablePodSecurityPolicies: false,
    parallelExecution: false,
    cleanupAfterTest: true,
    collectArtifacts: true,
    timeout: "30m",
    retries: 3,
  })

  const testTypes = [
    {
      id: "infrastructure",
      name: "Infrastructure Tests",
      description: "Test cluster infrastructure and node health",
      icon: Settings,
      features: ["Node readiness", "Network connectivity", "Storage availability"],
    },
    {
      id: "security",
      name: "Security Tests",
      description: "Test RBAC, network policies, and security configurations",
      icon: Shield,
      features: ["RBAC validation", "Network policy enforcement", "Pod security standards"],
    },
    {
      id: "performance",
      name: "Performance Tests",
      description: "Test cluster performance and resource limits",
      icon: Database,
      features: ["Resource quotas", "HPA scaling", "Load testing"],
    },
    {
      id: "networking",
      name: "Networking Tests",
      description: "Test service discovery, ingress, and network policies",
      icon: Network,
      features: ["Service connectivity", "Ingress routing", "DNS resolution"],
    },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background to-muted/30">
      <main className="flex-1">
        <div className="container py-6">
          <div className="flex items-center gap-2 mb-6">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/tests">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">Advanced Testing</h1>
          </div>

          <div className="grid gap-6 md:grid-cols-2 mb-8">
            {testTypes.map((testType) => {
              const Icon = testType.icon
              return (
                <Card key={testType.id} className="hover:shadow-md transition-all">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-primary" />
                      {testType.name}
                    </CardTitle>
                    <CardDescription>{testType.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      {testType.features.map((feature) => (
                        <div key={feature} className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        </div>
                      ))}
                    </div>
                    <Button className="w-full">
                      <Plus className="mr-2 h-4 w-4" />
                      Create {testType.name}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Test Configuration</CardTitle>
              <CardDescription>Advanced settings for test execution</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="font-medium">Security Features</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="rbac"
                        checked={testConfig.enableRBAC}
                        onCheckedChange={(checked) =>
                          setTestConfig({ ...testConfig, enableRBAC: checked })
                        }
                      />
                      <Label htmlFor="rbac">Enable RBAC Testing</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="network-policies"
                        checked={testConfig.enableNetworkPolicies}
                        onCheckedChange={(checked) =>
                          setTestConfig({ ...testConfig, enableNetworkPolicies: checked })
                        }
                      />
                      <Label htmlFor="network-policies">Enable Network Policy Testing</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="pod-security"
                        checked={testConfig.enablePodSecurityPolicies}
                        onCheckedChange={(checked) =>
                          setTestConfig({ ...testConfig, enablePodSecurityPolicies: checked })
                        }
                      />
                      <Label htmlFor="pod-security">Enable Pod Security Standards</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Execution Settings</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="parallel"
                        checked={testConfig.parallelExecution}
                        onCheckedChange={(checked) =>
                          setTestConfig({ ...testConfig, parallelExecution: checked })
                        }
                      />
                      <Label htmlFor="parallel">Parallel Execution</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="cleanup"
                        checked={testConfig.cleanupAfterTest}
                        onCheckedChange={(checked) =>
                          setTestConfig({ ...testConfig, cleanupAfterTest: checked })
                        }
                      />
                      <Label htmlFor="cleanup">Cleanup After Test</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="artifacts"
                        checked={testConfig.collectArtifacts}
                        onCheckedChange={(checked) =>
                          setTestConfig({ ...testConfig, collectArtifacts: checked })
                        }
                      />
                      <Label htmlFor="artifacts">Collect Artifacts</Label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="timeout">Test Timeout</Label>
                  <Input
                    id="timeout"
                    value={testConfig.timeout}
                    onChange={(e) => setTestConfig({ ...testConfig, timeout: e.target.value })}
                    placeholder="30m"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="retries">Retry Attempts</Label>
                  <Input
                    id="retries"
                    type="number"
                    value={testConfig.retries}
                    onChange={(e) =>
                      setTestConfig({ ...testConfig, retries: Number.parseInt(e.target.value) })
                    }
                    min="0"
                    max="10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="custom-config">Custom Kubernetes Configuration</Label>
                <Textarea
                  id="custom-config"
                  placeholder="Enter custom YAML configuration..."
                  rows={6}
                  className="font-mono text-sm"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
