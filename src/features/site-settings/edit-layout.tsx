import { ArrowLeft01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Link, type LinkProps } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

// Shared frame for the full-page create/edit screens
export function EditLayout({
  back,
  title,
  description,
  children,
  wide,
}: {
  back: LinkProps['to']
  title: string
  description: string
  children: ReactNode
  wide?: boolean
}) {
  return (
    <div className={wide ? 'mx-auto max-w-6xl' : 'mx-auto max-w-3xl'}>
      <div className="mb-6 flex items-center gap-3">
        <Link to={back} className={buttonVariants({ variant: 'ghost', size: 'icon' })} aria-label="Back">
          <HugeiconsIcon icon={ArrowLeft01Icon} />
        </Link>
        <div>
          <h1 className="font-semibold text-2xl tracking-tight">{title}</h1>
          <p className="mt-1 text-muted-foreground">{description}</p>
        </div>
      </div>
      <Card>
        <CardContent>{children}</CardContent>
      </Card>
    </div>
  )
}

export function FormActions({ back, children }: { back: LinkProps['to']; children: ReactNode }) {
  return (
    <div className="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-end [&>*]:sm:w-40">
      <Link to={back} className={buttonVariants({ variant: 'outline' })}>
        Cancel
      </Link>
      {children}
    </div>
  )
}
