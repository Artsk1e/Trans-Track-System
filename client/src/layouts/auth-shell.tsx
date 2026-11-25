import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { BackLink } from '@/components/ui/back-link'
import { BrandLogo } from '@/components/ui/brand-logo'

export interface AuthShellProps {
  children: ReactNode
  photoUrl?: string
  backHref?: string
  className?: string
}

export function AuthShell({ children, backHref, className }: AuthShellProps) {
  return (
    <div className={cn('min-h-screen relative flex', className)}>
      {/* Darken the landscape photo, then restore the bright portrait crop on the left. */}
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <img
          src="/assets/icons/boatbg1.png"
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-navy-overlay/80" />
        <img
          src="/assets/icons/boatbg2.png"
          alt=""
          className="absolute inset-y-0 left-0 hidden h-full w-[31%] object-cover md:block"
        />
      </div>

      {/* Back link */}
      {backHref && <BackLink href={backHref} />}

      {/* Logo — top-left over the photo side, per desktop mockups */}
      <div className="absolute top-6 left-6 z-10">
        <BrandLogo className="h-[74px] w-[160px]" />
      </div>

      {/* Card content */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-6 lg:pl-20">
        <div className="w-full max-w-[719px]">
          {children}
        </div>
      </div>
    </div>
  )
}
