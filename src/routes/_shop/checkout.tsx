import { ArrowLeft01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { createFileRoute, Link, useHydrated, useNavigate } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'
import { buttonVariants } from '@/components/ui/button'
import { getCurrentUser } from '@/features/auth/auth.functions'
import { CheckoutForm } from '@/features/checkout/checkout-form'
import { RouteError, RoutePending } from '@/features/pages/route-states'
import { useCart } from '@/lib/store'

export const Route = createFileRoute('/_shop/checkout')({
  loader: () => getCurrentUser(),
  head: () => ({ meta: [{ title: 'Checkout' }, { name: 'robots', content: 'noindex' }] }),
  pendingComponent: RoutePending,
  errorComponent: RouteError,
  component: CheckoutPage,
})

function CheckoutPage() {
  const user = Route.useLoaderData()
  const hydrated = useHydrated()
  const navigate = useNavigate()
  const { items, clearCart } = useCart()
  const placed = useRef(false)

  // Only after the saved cart has loaded in the browser, and never once an order was just placed
  useEffect(() => {
    if (hydrated && items.length === 0 && !placed.current) navigate({ to: '/cart', replace: true })
  }, [hydrated, items.length, navigate])

  if (!hydrated || items.length === 0) return <RoutePending />

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="font-semibold text-2xl tracking-tight">Checkout</h1>
        <Link to="/cart" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
          <HugeiconsIcon icon={ArrowLeft01Icon} />
          Back to cart
        </Link>
      </div>
      <CheckoutForm
        items={items}
        user={user}
        onPlaced={() => {
          placed.current = true
          clearCart()
        }}
      />
    </div>
  )
}
