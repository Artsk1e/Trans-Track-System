import { AuthShell } from '@/layouts/auth-shell'
import { PublicNav } from '@/components/molecules/public-nav'
import { VesselScheduleTable } from '@/components/organisms/vessel-schedule-table'
import { useNavigate } from 'react-router-dom'

const mockSchedules = [
  { vessel: 'MV Trans Asia 1', departure: '12/08/2026 14:30', status: 'On schedule' as const },
  { vessel: 'MV Trans Asia 2', departure: '12/08/2026 18:00', status: 'Delayed' as const },
  { vessel: 'MV Trans Asia 3', departure: '12/09/2026 08:00', status: 'In transit' as const },
  { vessel: 'MV Trans Asia 4', departure: '12/09/2026 12:00', status: 'On schedule' as const },
  { vessel: 'MV Trans Asia 5', departure: '12/09/2026 16:00', status: 'On schedule' as const },
  { vessel: 'MV Trans Asia 6', departure: '12/10/2026 10:00', status: 'Delayed' as const },
  { vessel: 'MV Trans Asia 7', departure: '12/10/2026 14:00', status: 'In transit' as const },
  { vessel: 'MV Trans Asia 8', departure: '12/11/2026 08:00', status: 'On schedule' as const },
]

export function SchedulePage() {
  const navigate = useNavigate()

  const handleTabChange = (tab: 'home' | 'schedule') => {
    if (tab === 'home') {
      navigate('/')
    }
  }

  return (
    <AuthShell backHref="/">
      <div className="w-full max-w-[719px]">
        <PublicNav 
          activeTab="schedule" 
          onTabChange={handleTabChange}
        />

        <div className="mt-6 card-base">
          <VesselScheduleTable
            schedules={mockSchedules}
            loading={false}
          />
        </div>
      </div>
    </AuthShell>
  )
}