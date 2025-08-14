"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@tatou/ui"
import { TrendChart } from "@/components/trend-chart"
import { COLOR_SCHEMES, type MetricCardProps } from "./metricsUtils"

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  className,
  trendData,
}: MetricCardProps) {
  const colorScheme = COLOR_SCHEMES[color]

  return (
    <Card className={`${colorScheme.cardBg} ${colorScheme.border} ${className || ""}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className={`text-sm font-medium ${colorScheme.title}`}>{title}</CardTitle>
        <Icon className={`h-4 w-4 ${colorScheme.icon}`} />
      </CardHeader>
      <CardContent>
        <div className={`text-xl sm:text-2xl font-bold ${colorScheme.value}`}>{value}</div>
        <p className={`text-xs ${colorScheme.subtitle}`}>{subtitle}</p>
        {trendData && (
          <div className="mt-3">
            <TrendChart data={trendData} color={color} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
