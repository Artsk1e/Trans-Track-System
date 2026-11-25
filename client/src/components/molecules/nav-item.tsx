import type { ButtonHTMLAttributes } from 'react'
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { Icon } from '@/components/ui/icon'

export interface NavItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: string
  label: string
  active?: boolean
}

export const NavItem = forwardRef<HTMLButtonElement, NavItemProps>(
  ({ className, icon, label, active = false, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'w-full flex items-center gap-3 px-4',
          'h-[51px] rounded-[var(--radius-nav-pill)]',
          'transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandYellow focus-visible:ring-offset-2 focus-visible:ring-offset-navy-overlay',
          active
            ? 'bg-brandYellow text-navy font-semibold'
            : 'text-white hover:bg-white/10',
          className
        )}
        aria-current={active ? 'page' : undefined}
        {...props}
      >
        <Icon
          name={icon as any}
          size="md"
          className={cn('flex-shrink-0', !active && 'brightness-0 invert')}
          aria-hidden="true"
        />
        <span className="text-base font-medium">{label}</span>
        {children}
      </button>
    )
  }
)

NavItem.displayName = 'NavItem'
