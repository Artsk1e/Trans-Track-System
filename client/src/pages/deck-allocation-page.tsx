import { AppShell } from '@/layouts/app-shell'
import { VesselSelect } from '@/components/molecules/vessel-select'
import { StatCard } from '@/components/molecules/stat-card'
import { DeckOverviewHero } from '@/components/organisms/deck-overview-hero'
import { AllocatedCargoTable } from '@/components/organisms/allocated-cargo-table'
import { CardHeader } from '@/components/molecules/card-header'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { useState } from 'react'

const vesselOptions = [
  { value: '1', label: 'MV Trans Asia 1' },
  { value: '2', label: 'MV Trans Asia 2' },
  { value: '3', label: 'MV Trans Asia 3' },
]

const mockAllocations = [
  { waybillNo: 'WB-2026-001', cargoType: 'Containers', spaceUsedSqft: 9000 },
  { waybillNo: 'WB-2026-002', cargoType: 'Vehicles', spaceUsedSqft: 5000 },
  { waybillNo: 'WB-2026-003', cargoType: 'General Cargo', spaceUsedSqft: 5000 },
]

export function DeckAllocationPage() {
  const [selectedVessel, setSelectedVessel] = useState('1')
  const [loading, setLoading] = useState(false)

  const handleVesselChange = (value: string) => {
    setSelectedVessel(value)
    setLoading(true)
    setTimeout(() => setLoading(false), 500)
  }

  return (
    <AppShell
      role="STAFF"
      activeRoute="/deck-allocation"
      userName="John Doe"
      onNavigate={(route) => console.log('Navigate to:', route)}
      onLogout={() => console.log('Logout')}
      onNotificationClick={() => console.log('Notifications')}
      unreadNotifications={3}
    >
      {/* Top Row: Vessel Select + Summary Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="card-base p-5 lg:col-span-1">
          <VesselSelect
            value={selectedVessel}
            onChange={handleVesselChange}
            options={vesselOptions}
            disabled={loading}
          />
        </div>

        <div className="lg:col-span-2 card-base p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard
            icon="Ship"
            label="Total Deck Space"
            value="50,000 sq.ft"
          />
          <StatCard
            icon="Box"
            label="Remaining Space"
            value="18,000 sq.ft"
          />
        </div>
      </div>

      {/* Deck Overview */}
      <div className="mb-4">
        <CardHeader icon="Ship" title="Deck Overview" />
        <DeckOverviewHero
          vesselName="Trans-Asia 19"
          imageUrl="https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=200&fit=crop"
          status="on-schedule"
        />
      </div>

      {/* Allocated Cargo */}
      <div>
        <CardHeader
          icon="Truck"
          title="Allocated Cargo"
          action={
            <Button variant="ghost" size="sm" onClick={() => console.log('View all')}>
              View all
              <Icon name="ChevronRight" size="sm" className="ml-1" aria-hidden="true" />
            </Button>
          }
        />
        <AllocatedCargoTable
          allocations={mockAllocations}
          loading={loading}
          onWaybillClick={(waybillNo) => console.log('Waybill:', waybillNo)}
          pagination={{
            currentPage: 1,
            totalPages: 3,
            onPageChange: (page) => console.log('Page:', page),
          }}
        />
      </div>
    </AppShell>
  )
}