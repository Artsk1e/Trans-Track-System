import { cn } from '@/lib/utils'

export function BrandLogo({ className }: { className?: string }) {
  return (
    <img
      src="/assets/icons/TransLogo.png"
      alt="Trans-Asia Shipping Lines"
      className={cn('object-contain', className)}
    />
  )
}
