import type { HTMLAttributes } from 'react'
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface StatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'info' | 'default'
}

const variantStyles = {
  success: 'bg-success-bg text-success-text',
  warning: 'bg-warning text-white',
  info: 'bg-info text-white',
  default: 'bg-page text-slate',
}

export const StatusBadge = forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center',
          'rounded-[var(--radius-badge)]',
          'h-[29px] px-[16px]',
          'text-sm font-medium',
          'whitespace-nowrap',
          variantStyles[variant],
          className
        )}
        {...props}
      >
        {children}
      </span>
    )
  }
)

StatusBadge.displayName = 'StatusBadge'