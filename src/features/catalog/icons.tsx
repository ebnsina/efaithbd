import { CreditCardIcon, CustomerSupportIcon, DeliveryTruck01Icon, PackageIcon, SecurityCheckIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { highlightIcons } from '@/features/highlights/icons'
import { cn } from '@/lib/utils'

// The admin's icon keys plus a few legacy names kept as aliases
const icons = {
  ...Object.fromEntries(Object.entries(highlightIcons).map(([key, { icon }]) => [key, icon])),
  truck: DeliveryTruck01Icon,
  secure: SecurityCheckIcon,
  headphones: CustomerSupportIcon,
  'credit-card': CreditCardIcon,
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
