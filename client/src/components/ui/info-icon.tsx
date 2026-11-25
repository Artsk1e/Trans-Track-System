import { cn } from '@/lib/utils'
import { Icon } from './icon'

export interface InfoIconProps {
  onClick?: () => void
  className?: string
}

export function InfoIcon({ onClick, className }: InfoIconProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors touch-target',
        className
      )}
      aria-label="Information"
    >
      <Icon name="Info" size="sm" aria-hidden="true" />
    </button>
  )
}