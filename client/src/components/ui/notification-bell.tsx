import type { ButtonHTMLAttributes } from 'react'
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { Icon } from './icon'

export interface NotificationBellProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  unreadCount?: number
}

export const NotificationBell = forwardRef<HTMLButtonElement, NotificationBellProps>(
  ({ className, unreadCount = 0, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'relative p-2 rounded-full',
          'text-slate hover:text-heading hover:bg-page',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandYellow focus-visible:ring-offset-2 focus-visible:ring-offset-white',
          'transition-colors duration-200',
          'touch-target',
          className
        )}
        aria-label="Notifications"
        {...props}
      >
        <Icon name="Bell" size="md" />
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 w-[10px] h-[10px] bg-white rounded-full border-2 border-navy flex items-center justify-center"
            aria-label={`${unreadCount} unread notifications`}
          >
            <span className="w-[6px] h-[6px] bg-navy rounded-full" />
          </span>
        )}
      </button>
    )
  }
)

NotificationBell.displayName = 'NotificationBell'