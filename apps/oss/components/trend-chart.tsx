"use client"

import { Area, AreaChart, ResponsiveContainer } from "recharts"

interface TrendChartProps {
  data: Array<{ date: string; value: number }>
  color: string
}

export function TrendChart({ data, color }: TrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          fill={color}
          fillOpacity={0.2}
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
