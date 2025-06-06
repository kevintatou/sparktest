"use client"

import { useState, useEffect } from "react"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts"

const initialData = [
  { name: "API Tests", value: 15, color: "#3b82f6" },
  { name: "Frontend Tests", value: 12, color: "#8b5cf6" },
  { name: "Security Tests", value: 8, color: "#ec4899" },
  { name: "Database Tests", value: 7, color: "#10b981" },
]

export function TestTypeDistribution() {
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

        // Randomly update one category's data
        const randomIndex = Math.floor(Math.random() * newData.length)
        const randomCategory = newData[randomIndex]

        // Small random change to value
        const valueChange = Math.floor(Math.random() * 3) - 1 // -1, 0, or 1
        const newValue = Math.max(5, randomCategory.value + valueChange)

        newData[randomIndex] = {
          ...randomCategory,
          value: newValue,
        }

        return newData
      })
    }, 7000) // Update every 7 seconds

    return () => clearInterval(interval)
  }, [])

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background p-2 rounded-md border shadow-sm">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-sm text-muted-foreground">{payload[0].value} tests</p>
        </div>
      )
    }
    return null
  }

  // Don't render the chart during SSR to avoid hydration issues
  if (!isMounted) {
    return (
      <div className="w-full h-full min-h-[200px] flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading chart...</div>
      </div>
    )
  }

  return (
    <div className="w-full h-full min-h-[200px]">
      <ResponsiveContainer width="100%" height="100%" minHeight={200}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{ fontSize: "12px" }} // Smaller font for mobile
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
