import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { Icon } from '@/components/ui/icon'

export interface AuthCardProps {
  title: string
  subtitle?: string
  titleIcon?: string
  children: React.ReactNode
  infoContent?: React.ReactNode
  className?: string
}

export const AuthCard = forwardRef<HTMLDivElement, AuthCardProps>(
  ({ className, title, subtitle, titleIcon, children, infoContent, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'bg-authCard rounded-[var(--radius-card)] p-[28px] w-full max-w-[719px]',
          'shadow-[0_20px_40px_rgba(0,0,0,0.3)]',
          className
        )}
        {...props}
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-[36px] font-bold text-white">{title}</h2>
              {titleIcon && <Icon name={titleIcon as any} size="lg" className="text-brandYellow" aria-hidden="true" />}
            </div>
            {subtitle && <p className="text-[20px] font-normal text-white/80">{subtitle}</p>}
          </div>
          {infoContent && (
            <button
              type="button"
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors touch-target"
              aria-label="Information"
            >
              <Icon name="Info" size="sm" aria-hidden="true" />
            </button>
          )}
        </div>

        <hr className="border-white/20 mb-6" aria-hidden="true" />

        {children}
      </div>
    )
  }
)

AuthCard.displayName = 'AuthCard'