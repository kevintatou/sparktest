"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const initialData = [
  { name: "Mon", passed: 12, failed: 1 },
  { name: "Tue", passed: 8, failed: 2 },
  { name: "Wed", passed: 15, failed: 0 },
  { name: "Thu", passed: 10, failed: 1 },
  { name: "Fri", passed: 14, failed: 1 },
  { name: "Sat", passed: 6, failed: 0 },
  { name: "Sun", passed: 9, failed: 1 },
]

export function StatusChart() {
  const [data, setData] = useState(initialData)
  const [isMounted, setIsMounted] = useState(false)

  // Mark component as mounted to avoid hydration issues
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setData((prevData) => {
        // Create a copy of the data
        const newData = [...prevData]

        // Randomly update one day's data
        const randomIndex = Math.floor(Math.random() * newData.length)
        const randomDay = newData[randomIndex]

        // Small random change to passed tests
        const passedChange = Math.floor(Math.random() * 3) - 1 // -1, 0, or 1
        const newPassed = Math.max(5, randomDay.passed + passedChange)

        // Small random change to failed tests
        const failedChange = Math.floor(Math.random() * 2) // 0 or 1
        const newFailed = Math.max(
          0,
          Math.min(3, randomDay.failed + (Math.random() > 0.7 ? failedChange : -failedChange)),
        )

        newData[randomIndex] = {
          ...randomDay,
          passed: newPassed,
          failed: newFailed,
        }

        return newData
      })
    }, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background p-2 rounded-md border shadow-sm">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-green-500">Passed: {payload[0].value}</p>
          <p className="text-sm text-red-500">Failed: {payload[1].value}</p>
        </div>
      )
    }
    return null
  }

  // Don't render the chart during SSR to avoid hydration issues
  if (!isMounted) {
    return (
      <div className="w-full h-full min-h-[120px] flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading chart...</div>
      </div>
    )
  }

  return (
    <div className="w-full h-full min-h-[120px]">
      <ResponsiveContainer width="100%" height="100%" minHeight={120}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
          <XAxis
            dataKey="name"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 10 }} // Smaller font for mobile
          />
          <YAxis hide />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="passed" stackId="stack" fill="#22c55e" radius={[4, 4, 0, 0]} />
          <Bar dataKey="failed" stackId="stack" fill="#ef4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
