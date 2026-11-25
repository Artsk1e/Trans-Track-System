import { cn } from '@/lib/utils'

export interface BackLinkProps {
  href?: string
  className?: string
}

export function BackLink({ href = '/', className }: BackLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        'absolute top-6 right-6 z-10 text-white text-sm font-medium hover:text-brandYellow transition-colors touch-target flex items-center gap-1',
        className
      )}
    >
      <span>Back</span>
      <span aria-hidden="true">&gt;</span>
    </a>
  )
}