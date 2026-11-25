import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { StatusBadge } from '@/components/ui/status-badge'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'

export interface VesselSchedule {
  vessel: string
  departure: string
  status: 'On schedule' | 'Delayed' | 'In transit'
}

export interface VesselScheduleTableProps {
  schedules?: VesselSchedule[]
  loading?: boolean
  emptyMessage?: string
  onViewAll?: () => void
  public?: boolean
  className?: string
}

const statusVariantMap: Record<VesselSchedule['status'], 'success' | 'warning' | 'info'> = {
  'On schedule': 'success',
  'Delayed': 'warning',
  'In transit': 'info',
}

export const VesselScheduleTable = forwardRef<HTMLDivElement, VesselScheduleTableProps>(
  ({ className, schedules = [], loading = false, emptyMessage = 'No vessel schedules found.', onViewAll, public: isPublic = false, ...props }, ref) => {
    // For public view, show 5 rows with blank content (vessel/departure empty, status badges visible)
    const publicScheduleRows: VesselSchedule[] = [
      { vessel: '', departure: '', status: 'On schedule' },
      { vessel: '', departure: '', status: 'On schedule' },
      { vessel: '', departure: '', status: 'Delayed' },
      { vessel: '', departure: '', status: 'In transit' },
      { vessel: '', departure: '', status: 'On schedule' },
    ]

    const displaySchedules = isPublic ? publicScheduleRows : schedules

    return (
      <div
        ref={ref}
        className={cn(
          'card-base overflow-hidden',
          className
        )}
        {...props}
      >
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-page">
                <th className="table-header rounded-tl-[var(--radius-control)]">Vessel</th>
                <th className="table-header text-center">Departure</th>
                <th className="table-header text-center rounded-tr-[var(--radius-control)]">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-textMuted">
                    <div className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-brandYellow" viewBox="0 0 24 24" aria-hidden="true">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Loading schedules...
                    </div>
                  </td>
                </tr>
              ) : displaySchedules.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-textMuted">{emptyMessage}</td>
                </tr>
              ) : (
                displaySchedules.map((schedule, index) => (
                  <tr key={`${schedule.vessel}-${index}`} className="table-row-hover">
                    <td className="table-cell font-medium">{schedule.vessel}</td>
                    <td className="table-cell text-center text-textMuted">{schedule.departure}</td>
                    <td className="table-cell text-center">
                      <StatusBadge variant={statusVariantMap[schedule.status]}>
                        {schedule.status}
                      </StatusBadge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {onViewAll && (
          <div className="p-4 pt-0 text-right">
            <Button variant="link" size="sm" onClick={onViewAll}>
              View all schedules
              <Icon name="ChevronRight" size="sm" className="ml-1" aria-hidden="true" />
            </Button>
          </div>
        )}
      </div>
    )
  }
)

VesselScheduleTable.displayName = 'VesselScheduleTable'