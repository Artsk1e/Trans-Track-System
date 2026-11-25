import type { HTMLAttributes } from 'react'
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface StatusDotProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'info'
  size?: 'sm' | 'md' | 'lg'
  label?: string // for accessibility
}

const variantStyles = {
  success: 'bg-success-bg',
  warning: 'bg-warning',
  info: 'bg-info',
}

const sizeStyles = {
  sm: 'w-[8px] h-[8px]',
  md: 'w-[12px] h-[12px]',
  lg: 'w-[16px] h-[16px]',
}

export const StatusDot = forwardRef<HTMLSpanElement, StatusDotProps>(
  ({ className, variant = 'success', size = 'md', label, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-block rounded-full',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        aria-label={label}
        {...props}
      />
    )
  }
)

StatusDot.displayName = 'StatusDot'