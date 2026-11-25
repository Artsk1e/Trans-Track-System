import { AuthShell } from '@/layouts/auth-shell'
import { AuthCard } from '@/components/organisms/auth-card'
import { PublicNav } from '@/components/molecules/public-nav'
import { TrackForm } from '@/components/molecules/track-form'
import { VesselScheduleTable } from '@/components/organisms/vessel-schedule-table'
import { useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'

const mockSchedules = [
  { vessel: 'MV Trans Asia 1', departure: '12/08/2026 14:30', status: 'On schedule' as const },
  { vessel: 'MV Trans Asia 2', departure: '12/08/2026 18:00', status: 'Delayed' as const },
  { vessel: 'MV Trans Asia 3', departure: '12/09/2026 08:00', status: 'In transit' as const },
  { vessel: 'MV Trans Asia 4', departure: '12/09/2026 12:00', status: 'On schedule' as const },
  { vessel: 'MV Trans Asia 5', departure: '12/09/2026 16:00', status: 'On schedule' as const },
]

interface TrackResult {
  found: boolean
  waybill?: string
  vessel?: string
  departure?: string
  status?: string
  timeline?: Array<{ event: string; time: string; status?: string }>
}

export function TrackPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const isScheduleRoute = location.pathname === '/schedule'

  const [waybillValue, setWaybillValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [trackResult, setTrackResult] = useState<TrackResult | null>(null)

  const handleTrack = () => {
    if (!waybillValue.trim()) return
    setLoading(true)
    setTrackResult(null)

    setTimeout(() => {
      setLoading(false)
      const found = Math.random() > 0.3 // 70% chance of finding
      if (found) {
        setTrackResult({
          found: true,
          waybill: waybillValue,
          vessel: 'MV Trans Asia 1',
          departure: '12/08/2026 14:30',
          status: 'On schedule',
          timeline: [
            { event: 'Booking confirmed', time: '10/12/2026 09:00' },
            { event: 'Documents processed', time: '10/12/2026 12:00' },
            { event: 'Cargo ready for loading', time: '11/12/2026 08:00' },
            { event: 'Loading completed', time: '11/12/2026 14:30', status: 'On schedule' },
          ]
        })
      } else {
        setTrackResult({ found: false, waybill: waybillValue })
      }
    }, 1000)
  }

  const handleTabChange = (tab: 'home' | 'schedule') => {
    if (tab === 'schedule') {
      navigate('/schedule')
    } else if (isScheduleRoute) {
      navigate('/track')
    }
  }

  // Show loading skeleton during track submission
  const renderLoadingSkeleton = () => (
    <div className="mt-6 p-4 border border-gold-line rounded-[var(--radius-control)] animate-pulse">
      <div className="h-6 bg-page/50 rounded w-3/4 mb-4"></div>
      <div className="space-y-3">
        <div className="flex justify-between">
          <div className="h-4 bg-page/50 rounded w-20"></div>
          <div className="h-4 bg-page/50 rounded w-32"></div>
        </div>
        <div className="flex justify-between">
          <div className="h-4 bg-page/50 rounded w-20"></div>
          <div className="h-4 bg-page/50 rounded w-32"></div>
        </div>
        <div className="flex justify-between">
          <div className="h-4 bg-page/50 rounded w-20"></div>
          <div className="h-4 bg-page/50 rounded w-32"></div>
        </div>
        <div className="h-4 bg-page/50 rounded w-24"></div>
      </div>
    </div>
  )

  // Show not found card
  const renderNotFound = () => (
    <div className="mt-6 p-4 bg-page rounded-[var(--radius-control)] border border-gold-line" role="status" aria-live="polite">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-warning flex items-center justify-center" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
            <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <h3 className="text-h3 font-semibold text-heading">Waybill Not Found</h3>
      </div>
      <p className="text-body text-textMuted">
        We could not locate waybill <span className="font-medium text-heading">"{trackResult?.waybill}"</span> in our system.
        Please verify the waybill number and try again.
      </p>
    </div>
  )

  // Show found timeline card
  const renderFoundTimeline = () => (
    <div className="mt-6 p-4 bg-page rounded-[var(--radius-control)] border border-gold-line" role="status" aria-live="polite">
      <h3 className="text-h3 mb-4 flex items-center gap-2">
        <span className="text-success-text font-bold">Shipment Found</span>
      </h3>
      
      {/* Key Info */}
      <div className="mb-4 space-y-2">
        <p className="text-sm text-textMuted">Waybill: <span className="font-medium">{trackResult?.waybill}</span></p>
        <p className="text-sm text-textMuted">
          Vessel: <span className="font-medium text-heading">{trackResult?.vessel}</span>
        </p>
        <p className="text-sm text-textMuted">
          Departure: <span className="font-medium text-heading">{trackResult?.departure}</span>
        </p>
        <p className="text-sm text-textMuted">
          Current Status: <span className="font-medium text-success-text">{trackResult?.status}</span>
        </p>
      </div>

      {/* Timeline */}
      <div className="border-l-2 border-gold-line pl-4 space-y-4">
        {trackResult?.timeline?.map((event, index) => (
          <div key={index} className="relative">
            <div className="absolute -left-[-10px] top-1">
              <div className="w-4 h-4 rounded-full bg-gold-line flex items-center justify-center">
                <div className={`w-2 h-2 rounded-full ${event.status === 'On schedule' ? 'bg-success-bg' : 'bg-textMuted'}`}></div>
              </div>
            </div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-heading">{event.event}</p>
                <p className="text-xs text-textMuted">{event.time}</p>
              </div>
              {event.status && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-success-bg text-success-text">
                  {event.status}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <AuthShell backHref="/">
      <div className="w-full max-w-[719px]">
        <PublicNav 
          activeTab={isScheduleRoute ? 'schedule' : 'home'} 
          onTabChange={handleTabChange}
        />

        <AuthCard
          title="Track Your Shipment!"
          subtitle="Enter your waybill number to track your shipment"
          titleIcon="Ship"
        >
          <TrackForm
            value={waybillValue}
            onChange={setWaybillValue}
            onSubmit={handleTrack}
            loading={loading}
          />

          {/* Track result states */}
          {loading && !trackResult && renderLoadingSkeleton()}
          
          {trackResult && !loading && trackResult.found && renderFoundTimeline()}
          
          {trackResult && !loading && !trackResult.found && renderNotFound()}
        </AuthCard>

        <div className="mt-6 card-base">
          <VesselScheduleTable
            schedules={mockSchedules}
            loading={loading}
          />
        </div>
      </div>
    </AuthShell>
  )
}