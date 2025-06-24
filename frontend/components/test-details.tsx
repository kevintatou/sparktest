"use client"

import { useState } from "react"

import type React from "react"
;/ '',6RSaaacceeeefimmooprrrstttttu{{}}

interface Test {
  id?: string
  createdAt?: string
  podScheduled?: string
  containerCreated?: string
  containerStarted?: string
  completed?: string
  failed?: string
}

interface TestDetailsProps {
  test: Test
}

const TestDetails: React.FC<TestDetailsProps> = ({ test }) => {
  const [activeTest, setActiveTest] = useState<Test>({
    ...test,
    // Ensure we always have a valid ISO string to avoid “Invalid time value”
    createdAt: test.createdAt && !Number.isNaN(Date.parse(test.createdAt)) ? test.createdAt : new Date().toISOString(),
  })

  // Utility: safely parse date or return "now"
  const safeDate = (d: string | undefined) => new Date(d && !Number.isNaN(Date.parse(d)) ? d : Date.now())

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Test Details</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">Information about the test run.</p>
      </div>
      <div className="border-t border-gray-200">
        <dl>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Job ID</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              <p className="mt-1 font-mono text-sm">{activeTest.id ?? "unknown-id"}</p>
            </dd>
          </div>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Job Created</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {formatDate(safeDate(activeTest.createdAt).toISOString())}
            </dd>
          </div>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Pod Scheduled</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {activeTest.podScheduled ? formatDate(safeDate(activeTest.podScheduled).toISOString()) : "N/A"}
            </dd>
          </div>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Container Created</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {activeTest.containerCreated ? formatDate(safeDate(activeTest.containerCreated).toISOString()) : "N/A"}
            </dd>
          </div>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Container Started</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {activeTest.containerStarted ? formatDate(safeDate(activeTest.containerStarted).toISOString()) : "N/A"}
            </dd>
          </div>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Completed / Failed</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {activeTest.completed
                ? formatDate(safeDate(activeTest.completed).toISOString())
                : activeTest.failed
                  ? formatDate(safeDate(activeTest.failed).toISOString())
                  : "N/A"}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  )
}

export default TestDetails
