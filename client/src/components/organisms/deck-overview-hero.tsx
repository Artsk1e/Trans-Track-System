import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { StatusDot } from '@/components/ui/status-dot'

export interface DeckOverviewHeroProps {
  vesselName: string
  imageUrl: string
  status: 'on-schedule' | 'delayed' | 'in-transit'
  className?: string
}

const statusConfig = {
  'on-schedule': { variant: 'success' as const, label: 'On Schedule' },
  'delayed': { variant: 'warning' as const, label: 'Delayed' },
  'in-transit': { variant: 'info' as const, label: 'In Transit' },
}

export const DeckOverviewHero = forwardRef<HTMLDivElement, DeckOverviewHeroProps>(
  ({ className, vesselName, imageUrl, status, ...props }, ref) => {
    const { variant, label } = statusConfig[status]

    return (
      <div
        ref={ref}
        className={cn(
          'bg-surface rounded-control overflow-hidden relative border border-gray-100',
          className
        )}
        {...props}
      >
        <img
          src={imageUrl}
          alt={`Deck overview of ${vesselName}`}
          className="w-full h-[190px] object-cover"
        />
        <div className="absolute top-4 left-4">
          <div className="bg-black/70 backdrop-blur-sm rounded-lg px-4 py-3 text-white">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg font-semibold">{vesselName}</span>
              <StatusDot variant={variant} size="md" label={label} />
            </div>
            <p className="text-sm font-medium capitalize">{label}</p>
          </div>
        </div>
      </div>
    )
  }
)

DeckOverviewHero.displayName = 'DeckOverviewHero'