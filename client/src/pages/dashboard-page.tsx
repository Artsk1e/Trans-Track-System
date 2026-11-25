import { AppShell } from '@/layouts/app-shell'
import { StatCard } from '@/components/molecules/stat-card'
import { DonutChart } from '@/components/organisms/donut-chart'
import { ReportHistoryTable } from '@/components/organisms/report-history-table'
import { CardHeader } from '@/components/molecules/card-header'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'

const mockStats = [
  { icon: 'Truck', label: 'Total Shipments', value: 248 },
  { icon: 'CheckCircle', label: 'On Time', value: '92.7%' },
  { icon: 'Package', label: 'Total Cargo', value: '12,800 Tons' },
  { icon: 'Clock', label: 'Delayed', value: '7.3%' },
]

const mockDonutData = { onTime: 230, delayed: 18, inTransit: 0 }
const mockTotal = 248

const mockReports = [
  { reportId: 'Rep-001', date: '08/12/2026', downloadUrl: '#' },
  { reportId: 'Rep-002', date: '08/12/2026', downloadUrl: '#' },
  { reportId: 'Rep-003', date: '08/12/2026', downloadUrl: '#' },
]

export function DashboardPage() {
  const handleDownload = (report: { reportId: string; downloadUrl: string }) => {
    console.log('Download:', report.downloadUrl)
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
      {/* Top KPI Card Section */}
      <div className="card-base p-6 mb-6">
        <CardHeader icon="TrendingUp" title="Today's Shipment Status" className="px-0 pt-0 pb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {mockStats.map((stat, index) => (
            <StatCard key={index} icon={stat.icon} label={stat.label} value={stat.value} className="bg-page border-none" />
          ))}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Donut Chart Card */}
        <div className="lg:col-span-5 card-base p-6">
          <CardHeader icon="Clock" title="Shipment Status" className="px-0 pt-0 pb-6" />
          <DonutChart data={mockDonutData} total={mockTotal} size={200} />
        </div>

        {/* Report History Card */}
        <div className="lg:col-span-7 card-base p-6">
          <CardHeader
            icon="FileText"
            title="Shipment Status History"
            className="px-0 pt-0 pb-6"
            action={
              <Button variant="ghost" size="sm" className="text-navy font-semibold hover:underline" onClick={() => console.log('View all')}>
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