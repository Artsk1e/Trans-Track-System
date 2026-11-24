import type { ReactNode } from 'react'
import { useState } from 'react'
import { Sidebar } from '@/components/organisms/sidebar'
import { TopBar } from '@/components/organisms/top-bar'
import { Icon } from '@/components/ui/icon'

export interface AppShellProps {
  children: ReactNode
  role: 'STAFF' | 'EXEC'
  activeRoute: string
  userName: string
  onNavigate: (route: string) => void
  onLogout: () => void
  onNotificationClick?: () => void
  unreadNotifications?: number
}

export function AppShell({
  children,
  role,
  activeRoute,
  userName,
  onNavigate,
  onLogout,
  onNotificationClick,
  unreadNotifications = 0,
}: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-page flex">
      <Sidebar
        role={role}
        activeRoute={activeRoute}
        onNavigate={onNavigate}
        onLogout={onLogout}
      />

      <div className="flex-1 flex flex-col min-w-0 lg:ml-[var(--sidebar-width)]">
        <TopBar
          title={activeRoute === '/waybills' ? 'Waybills' : activeRoute === '/deck-allocation' ? 'DECK ALLOCATION / CARGO SPACE' : 'Dashboard'}
          role={role}
          userName={userName}
          unreadNotifications={unreadNotifications}
          onNotificationClick={onNotificationClick}
        />

        <main className="flex-1 pt-0 lg:pt-0 pb-8">
          <div className="container-page">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile sidebar toggle */}
      <button
        type="button"
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-30 w-14 h-14 rounded-full bg-navy text-white shadow-lg flex items-center justify-center touch-target"
        aria-label="Open navigation menu"
        aria-expanded={sidebarOpen}
      >
        <Icon name="Menu" size="lg" aria-hidden="true" />
      </button>
    </div>
  )
}