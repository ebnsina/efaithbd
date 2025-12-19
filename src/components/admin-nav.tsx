'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Package,
  ShoppingBag,
  Layers,
  Settings,
  Image,
  LayoutGrid,
  Star,
  Footprints,
  Ticket,
  MessageSquare,
  StarIcon,
} from 'lucide-react'

interface NavItemProps {
  href: string
  label: string
  icon: string
  exact?: boolean
}

const iconMap = {
  LayoutGrid,
  Settings,
  Image,
  Layers,
  Package,
  ShoppingBag,
  Star,
  Footprints,
  Ticket,
  MessageSquare,
  StarIcon,
} as const

export function AdminNav({
  items,
  onItemClick,
}: {
  items: NavItemProps[]
  onItemClick?: () => void
}) {
  const pathname = usePathname()

  const isActive = (href: string, exact?: boolean) => {
    if (exact) {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  return (
    <div className="space-y-1">
      {items.map(item => {
        const active = isActive(item.href, item.exact)
        const Icon = iconMap[item.icon as keyof typeof iconMap]
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onItemClick}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors group font-medium',
              active
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>{item.label}</span>
          </Link>
        )
      })}
    </div>
  )
}
