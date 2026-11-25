import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/avatar'
import { NotificationBell } from '@/components/ui/notification-bell'
import { Icon } from '@/components/ui/icon'
import { useState, useRef, useEffect } from 'react'

export interface TopBarProps {
  title: string
  role: 'STAFF' | 'EXEC'
  userName: string
  unreadNotifications?: number
  onNotificationClick?: () => void
  onProfileClick?: () => void
  onLogout?: () => void
  className?: string
}

export const TopBar = forwardRef<HTMLDivElement, TopBarProps>(
  ({ className, title, role, userName, unreadNotifications = 0, onNotificationClick, onProfileClick, onLogout }, ref) => {
    const [menuOpen, setMenuOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
          setMenuOpen(false)
        }
      }
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleMenuKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false)
        menuRef.current?.querySelector('button')?.focus()
      }
    }

    return (
      <header
        ref={ref}
        className={cn(
          'flex items-center justify-between',
          'h-[var(--header-height)] px-5',
          'bg-transparent',
          className
        )}
        role="banner"
      >
        <div className="flex-1">
          <h1 className="text-h1">{title}</h1>
        </div>

        <div className="flex items-center gap-4">
          <NotificationBell
            unreadCount={unreadNotifications}
            onClick={onNotificationClick}
          />

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              onKeyDown={handleMenuKeyDown}
              className="flex items-center gap-2 p-1 rounded-full hover:bg-page transition-colors touch-target focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandYellow focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              aria-label="User menu"
            >
              <Avatar size="md" src="/assets/icons/user.png" alt={userName} />
              <span className="hidden sm:block text-sm font-medium text-heading">{userName}</span>
              <span className="hidden sm:block text-xs text-textMuted bg-page px-2 py-0.5 rounded-full">{role}</span>
              <Icon name="ChevronDown" size="sm" className="text-textMuted" aria-hidden="true" />
            </button>

            {menuOpen && (
              <div
                className="absolute right-0 mt-2 w-48 bg-surface rounded-lg border border-gray-100 shadow-lg py-1 z-50"
                role="menu"
                onKeyDown={handleMenuKeyDown}
              >
                <button
                  type="button"
                  onClick={() => { onProfileClick?.(); setMenuOpen(false); }}
                  className="w-full px-4 py-2 text-left text-sm text-textPrimary hover:bg-page transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brandYellow focus-visible:ring-inset focus:bg-page"
                  role="menuitem"
                >
                  Profile
                </button>
                <hr className="my-1 border-gray-100" />
                <button
                  type="button"
                  onClick={() => { onLogout?.(); setMenuOpen(false); }}
                  className="w-full px-4 py-2 text-left text-sm text-error hover:bg-page transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brandYellow focus-visible:ring-inset focus:bg-page"
                  role="menuitem"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    )
  }
)

TopBar.displayName = 'TopBar'
