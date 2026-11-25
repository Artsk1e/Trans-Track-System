import { Ship, Box, Truck, ChevronDown, ChevronRight, ChevronLeft, Menu, Bell, UserCircle, LogOut, Home, FileEdit, BarChart2, PieChart, Download, Eye, EyeOff, Search, Plus, Info, Clock, CheckCircle } from 'lucide-react'
import type { LucideIcon, LucideProps } from 'lucide-react'
import { forwardRef } from 'react'
import type { Ref } from 'react'
import { cn } from '@/lib/utils'

export interface IconProps extends Omit<LucideProps, 'ref'> {
  name: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap = {
  sm: 16,
  md: 20,
  lg: 24,
} as const

const iconMap: Record<string, LucideIcon> = {
  Ship,
  Box,
  Truck,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Menu,
  Bell,
  UserCircle,
  LogOut,
  Home,
  FileEdit,
  BarChart: BarChart2,
  Pie: PieChart,
  Download,
  Eye,
  EyeOff,
  Search,
  Plus,
  Info,
  Clock,
  CheckCircle,
}

const imageIconMap: Record<string, string> = {
  Ship: '/assets/icons/boat%202.png',
  Box: '/assets/icons/box%201.png',
  Truck: '/assets/icons/cargo-truck%202.png',
  Check: '/assets/icons/check%201.png',
  CheckCircle: '/assets/icons/check%201.png',
  Clock: '/assets/icons/clock%202.png',
  Bell: '/assets/icons/Group.png',
  UserCircle: '/assets/icons/Group-1.png',
  Home: '/assets/icons/Vector.png',
  LogOut: '/assets/icons/Vector-1.png',
  FileEdit: '/assets/icons/Mask%20group.png',
  FileText: '/assets/icons/Mask%20group.png',
  BarChart: '/assets/icons/Mask%20group-1.png',
  BarChart2: '/assets/icons/Mask%20group-1.png',
}

export const Icon = forwardRef<SVGSVGElement | HTMLImageElement, IconProps>(
  ({ name, size = 'md', className, strokeWidth = 2, ...props }, ref) => {
    const imageSrc = imageIconMap[name]
    if (imageSrc) {
      return (
        <img
          ref={ref as Ref<HTMLImageElement>}
          src={imageSrc}
          alt=""
          width={sizeMap[size]}
          height={sizeMap[size]}
          className={cn('inline-block object-contain', className)}
          aria-hidden={props['aria-hidden']}
        />
      )
    }

    const IconComponent = iconMap[name] || Ship
    return (
      <IconComponent
        ref={ref as Ref<SVGSVGElement>}
        size={sizeMap[size]}
        strokeWidth={strokeWidth}
        className={cn('text-current', className)}
        {...props}
      />
    )
  }
)

Icon.displayName = 'Icon'
