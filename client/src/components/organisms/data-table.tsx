import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { StatusBadge } from '@/components/ui/status-badge'

export interface DataTableColumn<T> {
  key: string
  header: string
  render?: (row: T) => React.ReactNode
  align?: 'left' | 'center' | 'right'
  width?: string
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  data: T[]
  loading?: boolean
  emptyMessage?: string
  onRowClick?: (row: T) => void
  pagination?: {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
  }
  className?: string
}

export function DataTable<T>({
  columns,
  data,
  loading = false,
  emptyMessage = 'No data found.',
  onRowClick,
  pagination,
  className,
}: DataTableProps<T>) {
  return (
    <div className={cn('card-base overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse" role="grid">
          <thead>
            <tr className="bg-page">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    'table-header',
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right',
                    columns[0].key === column.key && 'rounded-tl-[var(--radius-control)]',
                    columns[columns.length - 1].key === column.key && 'rounded-tr-[var(--radius-control)]',
                    column.width && `w-[${column.width}]`
                  )}
                  scope="col"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-textMuted">
                  <div className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-brandYellow" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Loading...
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-textMuted">{emptyMessage}</td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={cn('table-row-hover', onRowClick && 'cursor-pointer')}
                  onClick={() => onRowClick?.(row)}
                  role="row"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn(
                        'table-cell',
                        column.align === 'center' && 'text-center',
                        column.align === 'right' && 'text-right'
                      )}
                      role="gridcell"
                    >
                      {column.render ? column.render(row) : String(row[column.key as keyof T] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gold-line bg-page/50">
          <div className="text-sm text-textMuted">
            Page {pagination.currentPage} of {pagination.totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              aria-label="Previous page"
            >
              <Icon name="ChevronLeft" size="sm" aria-hidden="true" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              aria-label="Next page"
            >
              <Icon name="ChevronRight" size="sm" aria-hidden="true" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

DataTable.displayName = 'DataTable'

// Convenience export for waybill search results
export interface WaybillResult {
  waybillNo: string
  vessel: string
  departure: string
  destination: string
  status: 'On schedule' | 'Delayed' | 'In transit' | 'Pending'
  cargoType: string
  spaceUsedSqft: number
}

export const waybillColumns: DataTableColumn<WaybillResult>[] = [
  { key: 'waybillNo', header: 'Waybill No.', align: 'left', width: '180px' },
  { key: 'vessel', header: 'Vessel', align: 'left', width: '200px' },
  { key: 'departure', header: 'Departure', align: 'center', width: '180px' },
  { key: 'destination', header: 'Destination', align: 'center', width: '180px' },
  {
    key: 'status',
    header: 'Status',
    align: 'center',
    width: '150px',
    render: (row: WaybillResult) => {
      const statusVariantMap: Record<WaybillResult['status'], 'success' | 'warning' | 'info' | 'default'> = {
        'On schedule': 'success',
        'Delayed': 'warning',
        'In transit': 'info',
        'Pending': 'default',
      }
      return <StatusBadge variant={statusVariantMap[row.status]}>{row.status}</StatusBadge>
    },
  },
  { key: 'cargoType', header: 'Cargo Type', align: 'left', width: '150px' },
  {
    key: 'spaceUsedSqft',
    header: 'Space Used',
    align: 'right',
    width: '120px',
    render: (row: WaybillResult): string => `${row.spaceUsedSqft.toLocaleString()} sq.ft`,
  },
]