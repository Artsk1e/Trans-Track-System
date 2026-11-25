import type { HTMLAttributes } from 'react'
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { Icon } from '@/components/ui/icon'

export interface StatCardProps extends HTMLAttributes<HTMLDivElement> {
  icon: string
  label: string
  value: string | number
}

export const StatCard = forwardRef<HTMLDivElement, StatCardProps>(
  ({ className, icon, label, value, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center gap-4',
          'bg-page rounded-[16px]',
          'p-4',
          'w-full',
          'min-h-[94px]',
          className
        )}
        {...props}
      >
        <div className="flex-shrink-0 w-[48px] h-[48px] flex items-center justify-center bg-white rounded-xl shadow-sm">
          <Icon name={icon as any} size="lg" aria-hidden="true" className="text-black" />
        </div>
        <div className="min-w-0 flex flex-col">
          <p className="text-[18px] font-medium text-textPrimary">{label}</p>
          <p className="text-stat-value truncate">{value}</p>
        </div>
      </div>
    )
  }
)

StatCard.displayName = 'StatCard'