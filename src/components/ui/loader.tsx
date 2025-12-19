'use client'

import { ShoppingCart, Package, ShoppingBag } from 'lucide-react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'cart' | 'package' | 'bag'
  className?: string
}

const sizeMap = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
}

const iconSizeMap = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
}

export function Loader({
  size = 'md',
  variant = 'cart',
  className,
}: LoaderProps) {
  const Icon =
    variant === 'cart'
      ? ShoppingCart
      : variant === 'package'
      ? Package
      : ShoppingBag

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <motion.div
        className={cn(
          'relative flex items-center justify-center rounded-full',
          'bg-linear-to-br from-primary/10 to-primary/5',
          sizeMap[size]
        )}
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 360],
        }}
        transition={{
          duration: 2,
          ease: 'easeInOut',
          repeat: Infinity,
        }}
      >
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-primary/30"
          animate={{
            scale: [1, 1.3],
            opacity: [0.5, 0],
          }}
          transition={{
            duration: 1.5,
            ease: 'easeOut',
            repeat: Infinity,
          }}
        />
        <Icon className={cn('text-primary', iconSizeMap[size])} />
      </motion.div>
    </div>
  )
}

export function LoaderFullScreen({
  text = 'Loading...',
  variant = 'cart',
}: {
  text?: string
  variant?: 'cart' | 'package' | 'bag'
}) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
      <Loader size="lg" variant={variant} />
      <motion.p
        className="text-sm font-medium text-muted-foreground"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {text}
      </motion.p>
    </div>
  )
}

export function LoaderInline({
  text,
  variant = 'cart',
}: {
  text?: string
  variant?: 'cart' | 'package' | 'bag'
}) {
  return (
    <div className="flex items-center justify-center gap-3 py-8">
      <Loader size="sm" variant={variant} />
      {text && (
        <span className="text-sm font-medium text-muted-foreground">
          {text}
        </span>
      )}
    </div>
  )
}
