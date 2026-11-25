import { forwardRef, useMemo, useState } from 'react'
import { cn } from '@/lib/utils'

export interface DonutData {
  onTime: number
  delayed: number
  inTransit: number
}

export interface DonutChartProps {
  data: DonutData
  total: number
  size?: number
  strokeWidth?: number
  className?: string
}

const colors = {
  onTime: '#3DC47A',
  delayed: '#F5822A',
  inTransit: '#2F6FED',
}

export const DonutChart = forwardRef<HTMLDivElement, DonutChartProps>(
  ({ className, data, total, size = 180, strokeWidth = 22, ...props }, ref) => {
    const [hoveredKey, setHoveredKey] = useState<string | null>(null)

    const circumference = 2 * Math.PI * ((size - strokeWidth) / 2)

    const allItems = [
      { key: 'onTime', label: 'On Time', value: data.onTime, color: colors.onTime },
      { key: 'delayed', label: 'Delayed', value: data.delayed, color: colors.delayed },
      { key: 'inTransit', label: 'In Transit', value: data.inTransit, color: colors.inTransit },
    ]

    const segments = useMemo(() => {
      const activeItems = [
        { key: 'onTime', label: 'On Time', value: data.onTime, color: colors.onTime },
        { key: 'delayed', label: 'Delayed', value: data.delayed, color: colors.delayed },
        { key: 'inTransit', label: 'In Transit', value: data.inTransit, color: colors.inTransit },
      ].filter((d) => d.value > 0)

      const totalValue = activeItems.reduce((sum, d) => sum + d.value, 0) || 1
      let currentOffset = 0

      return activeItems.map((segment) => {
        const percentage = segment.value / totalValue
        const dashArray = `${percentage * circumference} ${circumference}`
        const dashOffset = -currentOffset
        currentOffset += percentage * circumference

        return {
          ...segment,
          percentage,
          dashArray,
          dashOffset,
        }
      })
    }, [data.onTime, data.delayed, data.inTransit, circumference])

    const radius = (size - strokeWidth) / 2
    const center = size / 2

    const hoveredItem = allItems.find((i) => i.key === hoveredKey)

    return (
      <div
        ref={ref}
        className={cn('flex flex-col sm:flex-row items-center justify-center gap-6 p-2', className)}
        {...props}
        role="img"
        aria-label={`Donut chart showing shipment status: ${data.onTime} on time, ${data.delayed} delayed, ${data.inTransit} in transit`}
      >
        {/* Chart SVG container */}
        <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
            {segments.map((segment) => {
              const isHovered = hoveredKey === segment.key
              return (
                <circle
                  key={segment.key}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke={segment.color}
                  strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={segment.dashArray}
                  strokeDashoffset={segment.dashOffset}
                  strokeLinecap="round"
                  className="transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setHoveredKey(segment.key)}
                  onMouseLeave={() => setHoveredKey(null)}
                />
              )
            })}
          </svg>

          {/* Center text / Tooltip overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {hoveredItem ? (
              <div className="text-center bg-heading/90 text-white px-3 py-1.5 rounded-lg shadow-md transition-all">
                <p className="text-xs font-semibold">{hoveredItem.label}</p>
                <p className="text-sm font-bold">{hoveredItem.value} ({((hoveredItem.value / (total || 1)) * 100).toFixed(1)}%)</p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-[32px] font-bold text-heading leading-tight">{total}</p>
                <p className="text-[14px] font-medium text-textMuted">Total</p>
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-3 text-sm">
          {allItems.map((item) => {
            const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0'
            const isHovered = hoveredKey === item.key

            return (
              <div
                key={item.key}
                className={cn(
                  'flex items-center gap-2.5 px-2 py-1 rounded-md transition-colors cursor-pointer',
                  isHovered && 'bg-page'
                )}
                onMouseEnter={() => setHoveredKey(item.key)}
                onMouseLeave={() => setHoveredKey(null)}
              >
                <span
                  className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                  aria-hidden="true"
                />
                <span className="font-semibold text-textPrimary text-sm">
                  {item.label} – <span className="font-bold">{pct}%</span>
                </span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
)

DonutChart.displayName = 'DonutChart'