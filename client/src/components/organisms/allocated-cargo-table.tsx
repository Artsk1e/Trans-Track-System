import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'

export interface AllocatedCargo {
  waybillNo: string
  cargoType: string
  spaceUsedSqft: number
}

export interface AllocatedCargoTableProps {
  allocations: AllocatedCargo[]
  loading?: boolean
  emptyMessage?: string
  onWaybillClick?: (waybillNo: string) => void
  pagination?: {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
  }
  className?: string
}

export const AllocatedCargoTable = forwardRef<HTMLDivElement, AllocatedCargoTableProps>(
  ({ className, allocations, loading = false, emptyMessage = 'No allocated cargo.', onWaybillClick, pagination, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'card-base overflow-hidden border border-gray-200',
          className
        )}
        {...props}
      >
        <Table>
          <TableHeader>
            <TableRow className="border-b-0 hover:bg-transparent">
              <TableHead className="w-[140px]">Waybill No</TableHead>
              <TableHead className="text-center">Cargo Type</TableHead>
              <TableHead className="text-right">Space Used (sq.ft)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="h-32 text-center">
                  <div className="flex items-center justify-center gap-2 text-textMuted">
                    <svg className="animate-spin h-5 w-5 text-brandYellow" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Loading allocations...
                  </div>
                </TableCell>
              </TableRow>
            ) : allocations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-32 text-center text-textMuted">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              allocations.map((allocation, index) => (
                <TableRow key={`${allocation.waybillNo}-${index}`} className="table-row-hover">
                  <TableCell className="font-mono">
                    <button
                      type="button"
                      onClick={() => onWaybillClick?.(allocation.waybillNo)}
                      className="hover:text-brandYellow underline focus:outline-none focus:ring-2 focus:ring-brandYellow focus:ring-offset-1 rounded"
                    >
                      {allocation.waybillNo}
                    </button>
                  </TableCell>
                  <TableCell className="text-center">{allocation.cargoType}</TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {allocation.spaceUsedSqft.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span className="text-sm text-textMuted">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
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
)

AllocatedCargoTable.displayName = 'AllocatedCargoTable'