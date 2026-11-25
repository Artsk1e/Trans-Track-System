import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { TextInput } from '@/components/ui/text-input'
import { Button } from '@/components/ui/button'

export interface TrackFormProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  loading?: boolean
  error?: string
  className?: string
}

export const TrackForm = forwardRef<HTMLFormElement, TrackFormProps>(
  ({ className, value, onChange, onSubmit, loading = false, error, ...props }, ref) => {
    return (
      <form
        ref={ref}
        onSubmit={(e) => { e.preventDefault(); onSubmit(); }}
        className={cn('w-full flex flex-col gap-4', className)}
        {...props}
      >
        <div className="relative">
          <TextInput
            variant="auth"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            aria-label="Waybill number"
            placeholder="Enter waybill number"
            error={error}
            disabled={loading}
            className="w-full"
          />
        </div>
        <Button
          type="submit"
          variant="primary"
          size="full-width"
          loading={loading}
          disabled={loading}
        >
          Track Shipment
        </Button>
      </form>
    )
  }
)

TrackForm.displayName = 'TrackForm'