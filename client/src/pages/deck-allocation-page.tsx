import { AppShell } from '@/layouts/app-shell'
import { VesselSelect } from '@/components/molecules/vessel-select'
import { StatCard } from '@/components/molecules/stat-card'
import { DeckOverviewHero } from '@/components/organisms/deck-overview-hero'
import { AllocatedCargoTable } from '@/components/organisms/allocated-cargo-table'
import { CardHeader } from '@/components/molecules/card-header'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { useState, useEffect } from 'react'

const vesselOptions = [
  { value: '1', label: 'MV Trans Asia 1' },
  { value: '2', label: 'MV Trans Asia 2' },
  { value: '3', label: 'MV Trans Asia 3' },
]

const mockData: Record<string, any> = {
  '1': {
    vesselName: 'Trans-Asia 19',
    totalSpace: 50000,
    remainingSpace: 18000,
    status: 'on-schedule' as const,
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1600&h=400&fit=crop',
    allocations: [
      { waybillNo: 'WB-2026-001', cargoType: 'Containers', spaceUsedSqft: 9000 },
      { waybillNo: 'WB-2026-002', cargoType: 'Vehicles', spaceUsedSqft: 5000 },
      { waybillNo: 'WB-2026-003', cargoType: 'General Cargo', spaceUsedSqft: 5000 },
    ]
  },
  '2': {
    vesselName: 'Trans-Asia 20',
    totalSpace: 60000,
    remainingSpace: 25000,
    status: 'on-schedule' as const,
    imageUrl: 'https://images.unsplash.com/photo-1559139225-3327ca229f61?w=1600&h=400&fit=crop',
    allocations: [
      { waybillNo: 'WB-2026-004', cargoType: 'Containers', spaceUsedSqft: 12000 },
      { waybillNo: 'WB-2026-005', cargoType: 'Heavy Equipment', spaceUsedSqft: 8000 },
    ]
  },
  '3': {
    vesselName: 'Trans-Asia 21',
    totalSpace: 45000,
    remainingSpace: 5000,
    status: 'delayed' as const,
    imageUrl: 'https://images.unsplash.com/photo-1516216628859-9bccecad83ef?w=1600&h=400&fit=crop',
    allocations: [
      { waybillNo: 'WB-2026-006', cargoType: 'Containers', spaceUsedSqft: 20000 },
      { waybillNo: 'WB-2026-007', cargoType: 'Vehicles', spaceUsedSqft: 15000 },
      { waybillNo: 'WB-2026-008', cargoType: 'General Cargo', spaceUsedSqft: 5000 },
    ]
  }
}

export function DeckAllocationPage() {
  const [selectedVesselId, setSelectedVesselId] = useState('1')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(mockData['1'])

  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => {
      setData(mockData[selectedVesselId])
      setLoading(false)
    }, 600)
    return () => clearTimeout(timer)
  }, [selectedVesselId])

  const usedSpace = data.totalSpace - data.remainingSpace
  const usedPercentage = Math.round((usedSpace / data.totalSpace) * 100)

  return (
    <AppShell
      role="STAFF"
      activeRoute="/deck-allocation"
      userName="Admin User"
      onNavigate={(route) => window.location.pathname = route}
      onLogout={() => console.log('Logout')}
      onNotificationClick={() => console.log('Notifications')}
      unreadNotifications={3}
    >
      <div className="space-y-4">
        {/* Top Row: Vessel Select + Summary Stats */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="card-base p-6 lg:w-[280px] flex flex-col justify-center">
            <VesselSelect
              value={selectedVesselId}
              onChange={setSelectedVesselId}
              options={vesselOptions}
              disabled={loading}
              className="w-full"
            />
          </div>

          <div className="flex-1 card-base p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatCard
              icon="Ship"
              label="Total Deck Space"
              value={`${data.totalSpace.toLocaleString()} sq.ft`}
            />
            <StatCard
              icon="Box"
              label="Remaining Space"
              value={`${data.remainingSpace.toLocaleString()} sq.ft`}
            />
          </div>
        </div>

        {/* Capacity Progress Bar */}
        <div className="card-base p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-slate uppercase tracking-wider">Deck Capacity</h3>
            <span className="text-sm font-bold text-navy">{usedPercentage}% Used</span>
          </div>
          <div className="w-full h-3 bg-page rounded-full overflow-hidden">
            <div 
              className="h-full bg-brandYellow transition-all duration-500 ease-out rounded-full"
              style={{ width: `${usedPercentage}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-textMuted">
            <span>0 sq.ft</span>
            <span>{usedSpace.toLocaleString()} sq.ft used</span>
            <span>{data.totalSpace.toLocaleString()} sq.ft total</span>
          </div>
        </div>

        {/* Deck Overview */}
        <div className="space-y-2">
          <CardHeader icon="Ship" title="DECK OVERVIEW" className="px-0 py-2" />
          <DeckOverviewHero
            vesselName={data.vesselName}
            imageUrl={data.imageUrl}
            status={data.status}
          />
        </div>

        {/* Allocated Cargo */}
        <div className="space-y-2">
          <CardHeader
            icon="Truck"
            title="ALLOCATED CARGO"
            className="px-0 py-2"
            action={
              <Button variant="ghost" size="sm" className="text-gold-link font-semibold">
                View all
                <Icon name="ChevronRight" size="sm" className="ml-1" aria-hidden="true" />
              </Button>
            }
          />
          <AllocatedCargoTable
            allocations={data.allocations}
            loading={loading}
            onWaybillClick={(waybillNo) => console.log('Waybill:', waybillNo)}
            pagination={{
              currentPage: 1,
              totalPages: 1,
              onPageChange: (page) => console.log('Page:', page),
            }}
          />
        </div>
      </div>
    </AppShell>
  )
}