"use client"

import { Run } from "@tatou/core/types"
import { Copy, Check } from "lucide-react"
import { useState } from "react"

interface CrdSourceDetailsProps {
  run: Run
  copyToClipboard: (text: string) => void
}

export const CrdSourceDetails = ({ run, copyToClipboard }: CrdSourceDetailsProps) => {
  const [copiedField, setCopiedField] = useState<string | null>(null)

  if (run.origin !== "crd" || !run.k8sRef) {
    return null
  }

  const handleCopy = (field: string, value: string) => {
    copyToClipboard(value)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">Source</h2>

      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="px-3 py-1.5 text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full">
            Started from TestRun CRD
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Namespace */}
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
              Namespace
            </label>
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700">
              <code className="flex-1 text-sm font-mono text-slate-900 dark:text-slate-100">
                {run.k8sRef.namespace}
              </code>
              <button
                onClick={() => handleCopy("namespace", run.k8sRef!.namespace)}
                className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                title="Copy namespace"
              >
                {copiedField === "namespace" ? (
                  <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                ) : (
                  <Copy className="h-4 w-4 text-slate-400" />
                )}
              </button>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
              TestRun Name
            </label>
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700">
              <code className="flex-1 text-sm font-mono text-slate-900 dark:text-slate-100">
                {run.k8sRef.name}
              </code>
              <button
                onClick={() => handleCopy("name", run.k8sRef!.name)}
                className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                title="Copy TestRun name"
              >
                {copiedField === "name" ? (
                  <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                ) : (
                  <Copy className="h-4 w-4 text-slate-400" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* kubectl Commands */}
        <div className="mt-6">
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-3">
            kubectl Commands
          </label>
          <div className="space-y-2">
            {/* Get TestRun */}
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700">
              <code className="flex-1 text-xs font-mono text-slate-700 dark:text-slate-300">
                kubectl get testrun {run.k8sRef.name} -n {run.k8sRef.namespace}
              </code>
              <button
                onClick={() =>
                  handleCopy(
                    "get-cmd",
                    `kubectl get testrun ${run.k8sRef!.name} -n ${run.k8sRef!.namespace}`
                  )
                }
                className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                title="Copy command"
              >
                {copiedField === "get-cmd" ? (
                  <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                ) : (
                  <Copy className="h-4 w-4 text-slate-400" />
                )}
              </button>
            </div>

            {/* Describe TestRun */}
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700">
              <code className="flex-1 text-xs font-mono text-slate-700 dark:text-slate-300">
                kubectl describe testrun {run.k8sRef.name} -n {run.k8sRef.namespace}
              </code>
              <button
                onClick={() =>
                  handleCopy(
                    "describe-cmd",
                    `kubectl describe testrun ${run.k8sRef!.name} -n ${run.k8sRef!.namespace}`
                  )
                }
                className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                title="Copy command"
              >
                {copiedField === "describe-cmd" ? (
                  <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                ) : (
                  <Copy className="h-4 w-4 text-slate-400" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
