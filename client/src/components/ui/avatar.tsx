import type { HTMLAttributes } from 'react'
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { Icon } from './icon'

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string
  alt?: string
  size?: 'sm' | 'md' | 'lg'
  withBadge?: boolean
  badgeVariant?: 'success' | 'warning' | 'info'
}

const sizeStyles = {
  sm: 'w-[32px] h-[32px] text-sm',
  md: 'w-[40px] h-[40px] text-base',
  lg: 'w-[48px] h-[48px] text-lg',
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt = 'User avatar', size = 'md', withBadge = false, badgeVariant = 'success', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative inline-flex items-center justify-center overflow-hidden rounded-full bg-page',
          'border-2 border-white',
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {src ? (
          <img src={src} alt={alt} className="w-full h-full object-cover" />
        ) : (
          <Icon name="UserCircle" size={size === 'sm' ? 'sm' : size === 'md' ? 'md' : 'lg'} className="text-slate" />
        )}
        {withBadge && (
          <span
            className={cn(
              'absolute bottom-0 right-0 rounded-full border-2 border-white',
              size === 'sm' && 'w-[10px] h-[10px]',
              size === 'md' && 'w-[12px] h-[12px]',
              size === 'lg' && 'w-[14px] h-[14px]',
              badgeVariant === 'success' && 'bg-success-bg',
              badgeVariant === 'warning' && 'bg-warning',
              badgeVariant === 'info' && 'bg-info'
            )}
            aria-label={`${badgeVariant} status`}
          />
        )}
      </div>
    )
  }
)

Avatar.displayName = 'Avatar'