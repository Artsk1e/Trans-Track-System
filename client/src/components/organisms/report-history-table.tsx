import { forwardRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export interface ReportHistoryItem {
  reportId: string
  date: string
  downloadUrl: string
}

export interface ReportHistoryTableProps {
  reports: ReportHistoryItem[]
  loading?: boolean
  downloadingId?: string | null
  emptyMessage?: string
  onDownload?: (report: ReportHistoryItem) => void
  className?: string
}

export const ReportHistoryTable = forwardRef<HTMLDivElement, ReportHistoryTableProps>(
  ({ className, reports, loading = false, downloadingId: externalDownloadingId, emptyMessage = 'No reports available.', onDownload, ...props }, ref) => {
    const [internalDownloadingId, setInternalDownloadingId] = useState<string | null>(null)
    const activeDownloadingId = externalDownloadingId !== undefined ? externalDownloadingId : internalDownloadingId

    const handleDownloadClick = async (report: ReportHistoryItem) => {
      setInternalDownloadingId(report.reportId)
      try {
        await onDownload?.(report)
      } finally {
        setTimeout(() => setInternalDownloadingId(null), 600)
      }
    }

    return (
      <div
        ref={ref}
        className={cn('w-full overflow-hidden', className)}
        {...props}
      >
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gold-line">
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate">Report ID</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-slate">Date</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-slate">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-textMuted">
                    <div className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-navy" viewBox="0 0 24 24" aria-hidden="true">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Loading reports...
                    </div>
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-textMuted">{emptyMessage}</td>
                </tr>
              ) : (
                reports.map((report, index) => {
                  const isDownloading = activeDownloadingId === report.reportId
                  return (
                    <tr key={`${report.reportId}-${index}`} className="border-b border-gold-line hover:bg-page/40 transition-colors">
                      <td className="px-6 py-4 font-mono text-sm text-textPrimary align-middle">{report.reportId}</td>
                      <td className="px-6 py-4 text-center text-sm text-textMuted align-middle">{report.date}</td>
                      <td className="px-6 py-4 text-center align-middle">
                        <div className="flex justify-center items-center">
                          <Button
                            variant="primary"
                            size="sm"
                            loading={isDownloading}
                            disabled={isDownloading}
                            onClick={() => handleDownloadClick(report)}
                            className="w-[76px] h-[31px] bg-navy text-white hover:bg-navy-dark text-[14px] font-medium rounded-full p-0 flex items-center justify-center"
                          >
                            Download
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    )
  }
)

ReportHistoryTable.displayName = 'ReportHistoryTable'