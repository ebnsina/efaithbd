import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          'bg-primary text-white rounded-md hover:shadow-md active:scale-[0.98] transition-all duration-200',
        destructive:
          'bg-red-600 text-white hover:bg-red-700 rounded-md hover:shadow-md active:scale-[0.98] focus-visible:ring-red-500',
        outline:
          'shop-btn-outline rounded-md active:scale-[0.98] transition-all duration-200',
        secondary:
          'bg-gray-100 text-gray-900 hover:bg-gray-200 rounded-md active:scale-[0.98]',
        ghost:
          'hover:bg-gray-100 rounded-md active:scale-[0.98] transition-all duration-200',
        link: 'underline-offset-4',
      },
      size: {
        default: 'h-11 px-6 py-2.5 has-[>svg]:px-5',
        sm: 'h-9 rounded-md gap-1.5 px-4 has-[>svg]:px-3 text-[13px]',
        lg: 'h-12 rounded-md px-8 has-[>svg]:px-6 text-base',
        icon: 'size-11 rounded-md',
        'icon-sm': 'size-9 rounded-md',
        'icon-lg': 'size-12 rounded-md',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
