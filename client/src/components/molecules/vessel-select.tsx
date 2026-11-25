import { forwardRef, useId } from 'react'
import { cn } from '@/lib/utils'
import { Select, type SelectOption } from '@/components/ui/select'
import { Icon } from '@/components/ui/icon'

export interface VesselSelectProps {
  label?: string
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  disabled?: boolean
  className?: string
}

export const VesselSelect = forwardRef<HTMLDivElement, VesselSelectProps>(
  ({ className, label = 'Select Vessel', value, onChange, options, disabled = false }, ref) => {
    const selectId = useId()
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange(e.target.value)
    }
    return (
      <div
        ref={ref}
        className={cn(
          'w-full sm:w-[230px]',
          className
        )}
      >
        {label && <label htmlFor={selectId} className="text-sm font-semibold text-slate mb-1.5 block">{label}</label>}
        <div className="relative">
          <Select
            id={selectId}
            options={options}
            value={value}
            onChange={handleChange}
            disabled={disabled}
            className="pl-10 pr-10"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate pointer-events-none">
            <Icon name="Ship" size="md" aria-hidden="true" />
          </div>
        </div>
      </div>
    )
  }
)

VesselSelect.displayName = 'VesselSelect'