import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'
import { useRouter } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: IconSvgElement
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <Empty className="border bg-card">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <HugeiconsIcon icon={icon} />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      {action && <EmptyContent>{action}</EmptyContent>}
    </Empty>
  )
}

export function RouteError() {
  const router = useRouter()
  return (
    <main className="container mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="font-semibold text-xl">Something went wrong</h1>
      <p className="text-muted-foreground">We couldn't load this page. Please check your connection and try again.</p>
      <Button onClick={() => router.invalidate()}>Try again</Button>
    </main>
  )
}

export function RoutePending() {
  return (
    <main className="container mx-auto max-w-3xl space-y-4 px-4 py-10" aria-busy="true">
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-32 w-full" />
    </main>
  )
}
