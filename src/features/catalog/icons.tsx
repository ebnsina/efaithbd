import { HugeiconsIcon } from '@hugeicons/react'
import { type HighlightIconKey, highlightIcons } from '@/features/highlights/icons'

// Highlight and feature card icons are stored as keys chosen in the admin
export function StoreIcon({ value, className }: { value: string; className?: string }) {
  const entry = highlightIcons[value as HighlightIconKey]
  return entry ? <HugeiconsIcon icon={entry.icon} className={className} /> : null
}
