import type { HTMLAttributes } from 'react'
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { Icon } from '@/components/ui/icon'

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  icon?: string
  title: string
  action?: React.ReactNode
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, icon, title, action, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-between',
          className
        )}
        {...props}
      >
        <div className="flex items-center gap-3">
          {icon && (
            <div className="w-8 h-8 bg-slate/10 rounded-lg flex items-center justify-center">
              <Icon name={icon as any} size="md" className="text-slate" aria-hidden="true" />
            </div>
          )}
          <h2 className="text-[20px] font-semibold text-heading">{title}</h2>
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    )
  }
)

CardHeader.displayName = 'CardHeader'