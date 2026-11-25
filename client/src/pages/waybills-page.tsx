import { AppShell } from '@/layouts/app-shell'
import { SearchPanel } from '@/components/molecules/search-panel'
import { VesselScheduleTable } from '@/components/organisms/vessel-schedule-table'
import { DataTable, type WaybillResult, waybillColumns } from '@/components/organisms/data-table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { TextInput } from '@/components/ui/text-input'
import { useState, useEffect, useRef } from 'react'

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'on-schedule', label: 'On Schedule' },
  { value: 'delayed', label: 'Delayed' },
  { value: 'in-transit', label: 'In Transit' },
]

const mockSchedules = [
  { vessel: 'MV Trans Asia 1', departure: '12/08/2026 14:30', status: 'On schedule' as const },
  { vessel: 'MV Trans Asia 2', departure: '12/08/2026 18:00', status: 'Delayed' as const },
  { vessel: 'MV Trans Asia 3', departure: '12/09/2026 08:00', status: 'In transit' as const },
  { vessel: 'MV Trans Asia 4', departure: '12/09/2026 12:00', status: 'On schedule' as const },
]

const mockWaybillResults: WaybillResult[] = [
  {
    waybillNo: 'WB-2026-001',
    vessel: 'MV Trans Asia 1',
    departure: '12/08/2026 14:30',
    destination: 'Cebu',
    status: 'On schedule',
    cargoType: 'Containers',
    spaceUsedSqft: 9000,
  },
  {
    waybillNo: 'WB-2026-002',
    vessel: 'MV Trans Asia 2',
    departure: '12/08/2026 18:00',
    destination: 'Davao',
    status: 'Delayed',
    cargoType: 'Vehicles',
    spaceUsedSqft: 5000,
  },
  {
    waybillNo: 'WB-2026-003',
    vessel: 'MV Trans Asia 3',
    departure: '12/09/2026 08:00',
    destination: 'Iloilo',
    status: 'In transit',
    cargoType: 'General Cargo',
    spaceUsedSqft: 5000,
  },
  {
    waybillNo: 'WB-2026-004',
    vessel: 'MV Trans Asia 1',
    departure: '12/09/2026 14:30',
    destination: 'Cebu',
    status: 'Pending',
    cargoType: 'Containers',
    spaceUsedSqft: 12000,
  },
  {
    waybillNo: 'WB-2026-005',
    vessel: 'MV Trans Asia 4',
    departure: '12/10/2026 10:00',
    destination: 'Zamboanga',
    status: 'On schedule',
    cargoType: 'Reefer',
    spaceUsedSqft: 3500,
  },
  {
    waybillNo: 'WB-2026-006',
    vessel: 'MV Trans Asia 2',
    departure: '12/10/2026 16:00',
    destination: 'Davao',
    status: 'Delayed',
    cargoType: 'Heavy Equipment',
    spaceUsedSqft: 8000,
  },
]

export function WaybillsPage() {
  const [waybillValue, setWaybillValue] = useState('')
  const [statusValue, setStatusValue] = useState('all')
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [showNewWaybillDialog, setShowNewWaybillDialog] = useState(false)
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Debounced search (300ms)
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    searchTimeoutRef.current = setTimeout(() => {
      if (waybillValue.trim() || statusValue !== 'all') {
        handleSearch()
      }
    }, 300)
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [waybillValue, statusValue])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSearch()
      }
    }
    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [waybillValue, statusValue])

  const handleSearch = () => {
    setLoading(true)
    setShowResults(true)
    setCurrentPage(1)
    setTimeout(() => setLoading(false), 500)
  }

  const handleNewWaybill = () => {
    setShowNewWaybillDialog(true)
  }

  const handleCloseDialog = () => {
    setShowNewWaybillDialog(false)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <AppShell
      role="STAFF"
      activeRoute="/waybills"
      userName="John Doe"
      onNavigate={(route) => console.log('Navigate to:', route)}
      onLogout={() => console.log('Logout')}
      onNotificationClick={() => console.log('Notifications')}
      unreadNotifications={3}
    >
      <SearchPanel
        waybillValue={waybillValue}
        onWaybillChange={setWaybillValue}
        statusValue={statusValue}
        onStatusChange={setStatusValue}
        onSearch={handleSearch}
        onNewWaybill={handleNewWaybill}
        statusOptions={statusOptions}
        loading={loading}
      />

      {showResults && (
        <div className="mt-6" role="region" aria-label="Waybill search results">
          <DataTable<WaybillResult>
            columns={waybillColumns}
            data={mockWaybillResults}
            loading={loading}
            emptyMessage="No waybills found matching your criteria."
            pagination={{
              currentPage,
              totalPages: 3,
              onPageChange: handlePageChange,
            }}
            onRowClick={(row) => console.log('Waybill clicked:', row.waybillNo)}
          />
        </div>
      )}

      <div className="mt-6" role="region" aria-label="Vessel schedules">
        <VesselScheduleTable
          schedules={mockSchedules}
          loading={loading}
          onViewAll={() => console.log('View all schedules')}
        />
      </div>

      <Dialog open={showNewWaybillDialog} onOpenChange={handleCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Waybill</DialogTitle>
            <DialogDescription>
              Create a new waybill for cargo shipment.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate mb-1.5 block" htmlFor="waybill-number">
                Waybill Number
              </label>
              <TextInput
                id="waybill-number"
                placeholder="WB-2026-XXX"
                variant="default"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate mb-1.5 block" htmlFor="cargo-type">
                Cargo Type
              </label>
              <TextInput
                id="cargo-type"
                placeholder="e.g., Containers, Vehicles"
                variant="default"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate mb-1.5 block" htmlFor="space-used">
                Space Used (sq.ft)
              </label>
              <TextInput
                id="space-used"
                type="number"
                placeholder="0"
                variant="default"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  )
}