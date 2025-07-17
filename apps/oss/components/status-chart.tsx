"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, ResponsiveContainer, Area, AreaChart } from "recharts"

interface StatusChartProps {
  data: Array<{ name: string; passed: number; failed: number }>
  type?: "bar" | "ratio"
}

export function StatusChart({ data, type = "bar" }: StatusChartProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-pulse bg-muted rounded h-full w-full"></div>
      </div>
    )
  }

  if (type === "ratio") {
    // Show a simple success rate area chart
    const ratioData = data.map((item) => ({
      name: item.name,
      ratio: Math.round((item.passed / (item.passed + item.failed)) * 100),
    }))

    return (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={ratioData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="ratioGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="ratio"
            stroke="#22c55e"
            strokeWidth={2}
            fill="url(#ratioGradient)"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <Bar dataKey="passed" stackId="stack" fill="#22c55e" radius={[2, 2, 0, 0]} />
        <Bar dataKey="failed" stackId="stack" fill="#ef4444" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
