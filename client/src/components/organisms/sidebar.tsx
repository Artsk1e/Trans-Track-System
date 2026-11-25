import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { NavItem } from '@/components/molecules/nav-item'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { BrandLogo } from '../ui/brand-logo'

export interface SidebarProps {
  role: 'STAFF' | 'EXEC'
  activeRoute: string
  onNavigate: (route: string) => void
  onLogout: () => void
  mobileOpen?: boolean
  onMobileClose?: () => void
  className?: string
}

const navItems = {
  STAFF: [
    { route: '/waybills', icon: 'FileText' as const, label: 'Waybills' },
    { route: '/deck-allocation', icon: 'Truck' as const, label: 'Deck Allocation' },
  ],
  EXEC: [
    { route: '/dashboard', icon: 'BarChart' as const, label: 'Dashboard' },
  ],
}

export const Sidebar = forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, role, activeRoute, onNavigate, onLogout, mobileOpen = false, onMobileClose }, ref) => {
    const items = navItems[role]
    const isOpen = mobileOpen

    return (
      <>
        {/* Mobile overlay */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => onMobileClose?.()}
            aria-hidden="true"
          />
        )}

        {/* Sidebar content */}
        <aside
          ref={ref}
          className={cn(
            'fixed lg:static inset-y-0 left-0 z-50',
            'h-screen w-[var(--sidebar-width)]',
            'flex flex-col',
            'bg-cover bg-center bg-no-repeat',
            'transition-transform duration-300 ease-in-out',
            'lg:translate-x-0',
            '-translate-x-full',
            isOpen && 'translate-x-0',
            className
          )}
          style={{
            backgroundImage: "linear-gradient(rgba(18, 41, 74, 0.86), rgba(18, 41, 74, 0.86)), url('/assets/icons/boatbg1.png')",
          }}
          role="navigation"
          aria-label="Main navigation"
        >
          {/* Logo */}
          <div className="flex items-center justify-between h-[80px] px-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <BrandLogo className="h-[69px] w-[150px]" />
            </div>
            <button
              type="button"
              onClick={() => onMobileClose?.()}
              className="lg:hidden p-2 text-white hover:text-brandYellow transition-colors"
              aria-label="Close sidebar"
            >
              <Icon name="X" size="md" aria-hidden="true" />
            </button>
          </div>

          {/* Divider */}
          <div className="border-t border-white/10 mx-4" aria-hidden="true" />

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto" aria-label="Navigation menu">
            {items.map((item) => (
              <NavItem
                key={item.route}
                icon={item.icon}
                label={item.label}
                active={activeRoute === item.route}
                onClick={() => {
                  onNavigate(item.route)
                  onMobileClose?.()
                }}
              />
            ))}
          </nav>

          {/* Divider */}
          <div className="border-t border-white/10 mx-4" aria-hidden="true" />

          {/* Logout */}
          <div className="p-4">
            <Button
              variant="ghost"
              size="full-width"
              onClick={onLogout}
              className="text-white hover:bg-white/10 justify-start gap-3"
            >
              <Icon name="LogOut" size="md" aria-hidden="true" />
              <span>Logout</span>
            </Button>
          </div>
        </aside>
      </>
    )
  }
)

Sidebar.displayName = 'Sidebar'
