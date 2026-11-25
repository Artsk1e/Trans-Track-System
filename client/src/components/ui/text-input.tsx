import type { InputHTMLAttributes, ReactNode } from 'react'
import { forwardRef, useId } from 'react'
import { cn } from '@/lib/utils'

export interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  variant?: 'default' | 'auth' | 'search'
  error?: string
  helperText?: string
  floatingLabel?: boolean
  children?: ReactNode
}

const variantStyles = {
  default: 'bg-page border-[1.5px] border-inputBorder h-[50px] px-4',
  auth: 'bg-white border-[1.5px] border-inputBorder h-[69px] px-4 text-lg',
  search: 'bg-page border-[1.5px] border-inputBorder h-[50px] px-4 pl-12',
}

const labelStyles = {
  default: 'text-sm font-semibold text-slate mb-1.5 block',
  auth: 'text-lg font-semibold text-white mb-1.5 block',
  search: 'sr-only',
}

const floatingLabelStyles = 'absolute left-4 top-1/2 -translate-y-1/2 text-textMuted transition-all duration-200 pointer-events-none peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-textMuted peer-focus:top-2 peer-focus:text-xs peer-focus:text-brandYellow peer-focus:-translate-y-full peer-focus:font-medium'

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ className, label, variant = 'default', error, helperText, floatingLabel = false, id: providedId, children, ...props }, ref) => {
    const generatedId = useId()
    const id = providedId || generatedId
    const errorId = `${id}-error`
    const helperId = `${id}-helper`
    const hasError = !!error

    return (
      <div className="w-full">
        {label && <label htmlFor={id} className={labelStyles[variant]}>{label}</label>}
        <div className="relative">
          {floatingLabel && label && (
            <span className={floatingLabelStyles} aria-hidden="true">{label}</span>
          )}
          <input
            ref={ref}
            id={id}
            className={cn(
              'w-full rounded-[var(--radius-control)] outline-none pr-10',
              'placeholder:text-textMuted',
              'focus-visible:ring-2 focus-visible:ring-brandYellow focus-visible:ring-offset-2 focus-visible:ring-offset-white',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-colors duration-200',
              variantStyles[variant],
              hasError && 'border-error focus-visible:ring-error',
              className
            )}
            aria-invalid={hasError}
            aria-describedby={hasError ? errorId : helperText ? helperId : undefined}
            {...props}
          />
          {children && (
            <div className="absolute inset-y-0 right-4 flex items-center">
              {children}
            </div>
          )}
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

TextInput.displayName = 'TextInput'