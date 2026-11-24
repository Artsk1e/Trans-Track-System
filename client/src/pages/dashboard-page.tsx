import { AppShell } from '@/layouts/app-shell'
import { StatCard } from '@/components/molecules/stat-card'
import { DonutChart } from '@/components/organisms/donut-chart'
import { ReportHistoryTable } from '@/components/organisms/report-history-table'
import { CardHeader } from '@/components/molecules/card-header'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'

const mockStats = [
  { icon: 'Truck', label: 'Total Shipments', value: 248 },
  { icon: 'CheckCircle', label: 'On Time %', value: '92.7%' },
  { icon: 'Box', label: 'Total Cargo (tons)', value: '12,800' },
  { icon: 'Clock', label: 'Delayed %', value: '7.3%' },
]

const mockDonutData = { onTime: 230, delayed: 18, inTransit: 0 }
const mockTotal = 248

const mockReports = [
  { reportId: 'Rep-001', date: '08/12/2026', downloadUrl: '#' },
  { reportId: 'Rep-002', date: '07/12/2026', downloadUrl: '#' },
  { reportId: 'Rep-003', date: '06/12/2026', downloadUrl: '#' },
]

export function DashboardPage() {
  const handleDownload = (url: string) => {
    console.log('Download:', url)
  }

  return (
    <AppShell
      role="EXEC"
      activeRoute="/dashboard"
      userName="Jane Smith"
      onNavigate={(route) => console.log('Navigate to:', route)}
      onLogout={() => console.log('Logout')}
      onNotificationClick={() => console.log('Notifications')}
      unreadNotifications={1}
    >
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {mockStats.map((stat, index) => (
          <StatCard key={index} icon={stat.icon} label={stat.label} value={stat.value} />
        ))}
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Donut Chart */}
        <div className="lg:col-span-5 card-base p-5">
          <CardHeader icon="PieChart" title="Today&apos;s Shipment Status" />
          <DonutChart data={mockDonutData} total={mockTotal} size={200} />
        </div>

        {/* Report History */}
        <div className="lg:col-span-7 card-base">
          <CardHeader
            icon="FileText"
            title="Shipment Status History"
            action={
              <Button variant="ghost" size="sm" onClick={() => console.log('View all')}>
                View all
                <Icon name="ChevronRight" size="sm" className="ml-1" aria-hidden="true" />
              </Button>
            }
          />
          <ReportHistoryTable
            reports={mockReports}
            loading={false}
            onDownload={handleDownload}
          />
        </div>
      </div>
    </AppShell>
  )
}