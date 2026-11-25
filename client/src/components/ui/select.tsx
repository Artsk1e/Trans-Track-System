import type { SelectHTMLAttributes } from 'react'
import { forwardRef, useId } from 'react'
import { cn } from '@/lib/utils'
import { Icon } from './icon'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: SelectOption[]
  placeholder?: string
  error?: string
  helperText?: string
  centered?: boolean
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, options, placeholder, error, helperText, centered = false, id: providedId, ...props }, ref) => {
    const generatedId = useId()
    const id = providedId || generatedId
    const errorId = `${id}-error`
    const helperId = `${id}-helper`
    const hasError = !!error

    return (
      <div className="w-full">
        {label && <label htmlFor={id} className="text-sm font-semibold text-slate mb-1.5 block">{label}</label>}
        <div className="relative">
          <select
            ref={ref}
            id={id}
            className={cn(
              'w-full h-[50px] bg-page border-[1.5px] border-inputBorder rounded-[var(--radius-control)] px-4 pr-10',
              'appearance-none',
              'outline-none',
              'focus-visible:ring-2 focus-visible:ring-brandYellow focus-visible:ring-offset-2 focus-visible:ring-offset-white',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-colors duration-200',
              centered && 'text-center',
              hasError && 'border-error focus-visible:ring-error',
              className
            )}
            aria-invalid={hasError}
            aria-describedby={hasError ? errorId : helperText ? helperId : undefined}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-textMuted">
            <Icon name="ChevronDown" size="sm" aria-hidden="true" />
          </div>
        </div>
        {hasError && (
          <p id={errorId} className="mt-1.5 text-sm text-error" role="alert">{error}</p>
        )}
        {!hasError && helperText && (
          <p id={helperId} className="mt-1.5 text-sm text-textMuted">{helperText}</p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'