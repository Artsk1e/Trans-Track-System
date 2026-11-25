import type { HTMLAttributes } from 'react'
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface PublicNavProps extends HTMLAttributes<HTMLElement> {
  brandText?: string
  activeTab?: 'home' | 'schedule'
  onTabChange?: (tab: 'home' | 'schedule') => void
}

export const PublicNav = forwardRef<HTMLElement, PublicNavProps>(
  ({ className, brandText = 'Trans-Track System', activeTab = 'home', onTabChange, ...props }, ref) => {
    return (
      <nav
        ref={ref}
        className={cn(
          'card-base',
          'rounded-t-[var(--radius-card)] rounded-b-none',
          'border-b border-gold-line',
          className
        )}
        {...props}
      >
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="text-h3 font-bold text-navy">{brandText}</span>
          </div>
          <div className="flex items-center gap-4 text-base font-normal text-textMuted">
            <button
              type="button"
              onClick={() => onTabChange?.('home')}
              className={cn(
                'transition-colors duration-200',
                activeTab === 'home' ? 'text-heading font-semibold' : 'hover:text-heading'
              )}
              aria-current={activeTab === 'home' ? 'page' : undefined}
            >
              Home
            </button>
            <span aria-hidden="true" className="text-textMuted">|</span>
            <button
              type="button"
              onClick={() => onTabChange?.('schedule')}
              className={cn(
                'transition-colors duration-200',
                activeTab === 'schedule' ? 'text-heading font-semibold' : 'hover:text-heading'
              )}
              aria-current={activeTab === 'schedule' ? 'page' : undefined}
            >
              Schedule
            </button>
          </div>
        </div>
      </nav>
    )
  }
)

PublicNav.displayName = 'PublicNav'