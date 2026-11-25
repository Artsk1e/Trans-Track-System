import type { ButtonHTMLAttributes } from 'react'
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'link' | 'danger'
  size?: 'sm' | 'md' | 'lg' | 'full-width'
  loading?: boolean
}

const variantStyles = {
  primary: 'bg-navy text-white hover:bg-navy-dark focus-visible:ring-brandYellow',
  secondary: 'bg-slate text-white hover:bg-slate/90 focus-visible:ring-brandYellow',
  ghost: 'bg-transparent text-heading hover:bg-page focus-visible:ring-brandYellow',
  link: 'bg-transparent text-gold-link hover:underline focus-visible:ring-brandYellow px-0',
  danger: 'bg-error text-white hover:bg-error/90 focus-visible:ring-brandYellow',
}

const sizeStyles = {
  sm: 'h-[31px] px-4 text-button-label-sm rounded-[var(--radius-pill)]',
  md: 'h-[45px] px-6 text-button-label rounded-[var(--radius-control)]',
  lg: 'h-[61px] px-8 text-button-label rounded-[var(--radius-control)]',
  'full-width': 'w-full h-[61px] px-8 text-button-label rounded-[var(--radius-control)]',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading = false, disabled, children, ...props }, ref) => {
    const isDisabled = disabled || loading
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-semibold transition-colors duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandYellow focus-visible:ring-offset-2 focus-visible:ring-offset-white',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'active:scale-[0.98]',
          'touch-target',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        disabled={isDisabled}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'