import { StarIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { cn } from '@/lib/utils'

export function Stars({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn('inline-flex text-primary', className)} role="img" aria-label={`${value.toFixed(1)} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <HugeiconsIcon
          key={star}
          icon={StarIcon}
          className={cn('size-[1em]', star > Math.round(value) && 'text-muted-foreground/40')}
          fill={star <= Math.round(value) ? 'currentColor' : 'none'}
        />
      ))}
    </span>
  )
}
