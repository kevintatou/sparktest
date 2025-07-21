import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { TrendChart } from '@/components/trend-chart'

// Mock recharts components
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  AreaChart: ({ children, data }: { children: React.ReactNode; data: any[] }) => (
    <div data-testid="area-chart" data-data-length={data.length}>{children}</div>
  ),
  Area: ({ dataKey, stroke, fill }: { dataKey: string; stroke: string; fill: string }) => (
    <div data-testid="area" data-datakey={dataKey} data-stroke={stroke} data-fill={fill} />
  ),
}))

describe('TrendChart', () => {
  const mockData = [
    { date: '2024-01-01', value: 10 },
    { date: '2024-01-02', value: 15 },
    { date: '2024-01-03', value: 12 },
  ]

  it('renders without crashing', () => {
    const { getByTestId } = render(
      <TrendChart data={mockData} color="#ff0000" />
    )
    
    expect(getByTestId('responsive-container')).toBeInTheDocument()
    expect(getByTestId('area-chart')).toBeInTheDocument()
    expect(getByTestId('area')).toBeInTheDocument()
  })

  it('passes correct data to AreaChart', () => {
    const { getByTestId } = render(
      <TrendChart data={mockData} color="#ff0000" />
    )
    
    const areaChart = getByTestId('area-chart')
    expect(areaChart).toHaveAttribute('data-data-length', '3')
  })

  it('passes correct props to Area component', () => {
    const color = '#00ff00'
    const { getByTestId } = render(
      <TrendChart data={mockData} color={color} />
    )
    
    const area = getByTestId('area')
    expect(area).toHaveAttribute('data-datakey', 'value')
    expect(area).toHaveAttribute('data-stroke', color)
    expect(area).toHaveAttribute('data-fill', color)
  })

  it('handles empty data array', () => {
    const { getByTestId } = render(
      <TrendChart data={[]} color="#0000ff" />
    )
    
    expect(getByTestId('responsive-container')).toBeInTheDocument()
    const areaChart = getByTestId('area-chart')
    expect(areaChart).toHaveAttribute('data-data-length', '0')
  })
})