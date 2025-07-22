"use client"

import { Run } from "@sparktest/core/types"
import { KubernetesLogs } from "@/components/kubernetes-logs"
import { useRunDetails } from "./useRunDetails"
import { RunOverview } from "./RunOverview"
import { DefinitionDetails } from "./DefinitionDetails"
import { ExecutorDetails } from "./ExecutorDetails"
import { KubernetesTimeline } from "./KubernetesTimeline"
import type React from "react"

interface TestDetailsProps {
  test: Run
}

export const RunDetails: React.FC<TestDetailsProps> = ({ test: run }) => {
  const {
    activeRun,
    definition,
    executor,
    loading,
    safeDate,
    formatDate,
    copyToClipboard,
  } = useRunDetails({ run })

  if (loading) {
    return <div className="space-y-6">Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Run Overview */}
      <RunOverview 
        run={activeRun}
        formatDate={formatDate}
        safeDate={safeDate}
        copyToClipboard={copyToClipboard}
      />

      {/* Test Definition Details */}
      {definition && (
        <DefinitionDetails
          definition={definition}
          copyToClipboard={copyToClipboard}
        />
      )}

      {/* Executor Details */}
      {executor && (
        <ExecutorDetails
          executor={executor}
          copyToClipboard={copyToClipboard}
        />
      )}

      {/* Kubernetes Timeline */}
      <KubernetesTimeline
        run={activeRun}
        formatDate={formatDate}
        safeDate={safeDate}
      />

      {/* Kubernetes Logs */}
      <KubernetesLogs runId={activeRun.id} jobName={activeRun.k8sJobName} />
    </div>
  )
}

export default RunDetails