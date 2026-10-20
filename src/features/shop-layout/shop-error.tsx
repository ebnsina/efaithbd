import { Alert02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { type ErrorComponentProps, Link, useRouter } from '@tanstack/react-router'
import { Button, buttonVariants } from '@/components/ui/button'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'

// Route-level error screen for storefront pages; keeps the navbar and footer around it
export function ShopError({ reset }: ErrorComponentProps) {
  const router = useRouter()
  return (
    <Empty className="min-h-[50vh]">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <HugeiconsIcon icon={Alert02Icon} />
        </EmptyMedia>
        <EmptyTitle>This page didn't load</EmptyTitle>
        <EmptyDescription>Please check your connection and try again.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex-row justify-center gap-2">
        <Button
          onClick={() => {
            reset()
            router.invalidate()
          }}
        >
          Try again
        </Button>
        <Link to="/" className={buttonVariants({ variant: 'outline' })}>
          Go to the homepage
        </Link>
      </EmptyContent>
    </Empty>
  )
}
