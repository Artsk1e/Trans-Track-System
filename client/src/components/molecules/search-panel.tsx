import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { TextInput } from '@/components/ui/text-input'
import { Select, type SelectOption } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'

export interface SearchPanelProps {
  waybillValue: string
  onWaybillChange: (value: string) => void
  statusValue: string
  onStatusChange: (value: string) => void
  onSearch: () => void
  onNewWaybill: () => void
  statusOptions: SelectOption[]
  loading?: boolean
  className?: string
}

export const SearchPanel = forwardRef<HTMLDivElement, SearchPanelProps>(
  ({ className, waybillValue, onWaybillChange, statusValue, onStatusChange, onSearch, onNewWaybill, statusOptions, loading = false }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'card-base p-5',
          'flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-4',
          className
        )}
      >
        <div className="w-full sm:w-[280px]">
          <label htmlFor="waybill-search" className="text-sm font-semibold text-slate mb-1.5 block">
            Waybill Number
          </label>
          <div className="relative">
            <Icon name="Search" size="md" className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" aria-hidden="true" />
            <TextInput
              id="waybill-search"
              variant="search"
              value={waybillValue}
              onChange={(e) => onWaybillChange(e.target.value)}
              placeholder="Enter waybill number..."
              floatingLabel
              disabled={loading}
            />
          </div>
        </div>

        <div className="w-full sm:w-[200px]">
          <label htmlFor="status-filter" className="text-sm font-semibold text-slate mb-1.5 block">
            Status
          </label>
          <Select
            id="status-filter"
            options={statusOptions}
            value={statusValue}
            onChange={(e) => onStatusChange(e.target.value)}
            centered
            disabled={loading}
          />
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
          <Button
            variant="primary"
            size="md"
            onClick={onSearch}
            loading={loading}
            className="flex-1 sm:flex-none"
          >
            Search
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={onNewWaybill}
            disabled={loading}
            className="flex-1 sm:flex-none"
          >
            <Icon name="Plus" size="sm" className="mr-2" aria-hidden="true" />
            + New Waybills
          </Button>
        </div>
      </div>
    )
  }
)

SearchPanel.displayName = 'SearchPanel'