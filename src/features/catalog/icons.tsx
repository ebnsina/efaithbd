import {
  CreditCardIcon,
  CustomerSupportIcon,
  DeliveryTruck01Icon,
  GiftIcon,
  PackageIcon,
  ReturnRequestIcon,
  SecurityCheckIcon,
  Shield01Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { cn } from '@/lib/utils'

// Admin-entered icon keys (Highlight.icon, FeatureCard.icon); a few legacy names are kept as aliases
const icons = {
  delivery: DeliveryTruck01Icon,
  truck: DeliveryTruck01Icon,
  returns: ReturnRequestIcon,
  shield: Shield01Icon,
  secure: SecurityCheckIcon,
  support: CustomerSupportIcon,
  headphones: CustomerSupportIcon,
  payment: CreditCardIcon,
  'credit-card': CreditCardIcon,
  gift: GiftIcon,
  package: PackageIcon,
}

// Unknown keys are shown as typed (e.g. an emoji), image URLs as images
export function StoreIcon({ value, className }: { value: string; className?: string }) {
  const icon = icons[value.trim().toLowerCase() as keyof typeof icons]
  if (icon) return <HugeiconsIcon icon={icon} className={className} />
  if (/^(https?:)?\/\//.test(value) || value.startsWith('/')) {
    return <img src={value} alt="" width={24} height={24} loading="lazy" decoding="async" className={className} />
  }
  return (
    <span aria-hidden className={cn('inline-flex items-center justify-center leading-none', className)}>
      {value}
    </span>
  )
}
