import Link from 'next/link'
import { cn } from '@/lib/utils'

type ShopButtonProps = {
  href?: string
  onClick?: () => void
  variant?: 'primary' | 'outline'
  children: React.ReactNode
  className?: string
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
}

export function ShopButton({
  href,
  onClick,
  variant = 'primary',
  children,
  className,
  type = 'button',
  disabled = false,
}: ShopButtonProps) {
  const baseStyles =
    'flex-1 px-4 py-3 rounded text-center transition-colors duration-200 font-medium inline-block'

  const variantStyles = {
    primary:
      'bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed',
    outline:
      'border border-primary text-primary hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed',
  }

  const combinedClassName = cn(baseStyles, variantStyles[variant], className)

  if (href && !disabled) {
    return (
      <Link href={href} className={combinedClassName}>
        {children}
      </Link>
    )
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={combinedClassName}
    >
      {children}
    </button>
  )
}
