import { Logout01Icon, PackageIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link, redirect, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { getCurrentUser, logout } from '@/features/auth/auth.functions'
import { myOrdersQuery } from '@/features/orders/queries'
import { OrderStatusBadge } from '@/features/orders/status'
import { EmptyState, RouteError, RoutePending } from '@/features/pages/route-states'
import { formatDate, useMoney } from '@/lib/format'

export const Route = createFileRoute('/_shop/orders/')({
  beforeLoad: async () => {
    const user = await getCurrentUser()
    if (!user) throw redirect({ to: '/login', search: { redirect: '/orders' } })
    return { user }
  },
  loader: ({ context }) => context.queryClient.ensureQueryData(myOrdersQuery(context.user.id)),
  head: () => ({ meta: [{ title: 'My orders' }, { name: 'robots', content: 'noindex' }] }),
  pendingComponent: RoutePending,
  errorComponent: RouteError,
  component: MyOrdersPage,
})

function MyOrdersPage() {
  const { user } = Route.useRouteContext()
  const { data: orders } = useSuspenseQuery(myOrdersQuery(user.id))
  const money = useMoney()
  const router = useRouter()
  const [signingOut, setSigningOut] = useState(false)

  const signOut = async () => {
    setSigningOut(true)
    try {
      await logout()
      await router.invalidate()
      await router.navigate({ to: '/' })
    } catch {
      toast.error("We couldn't sign you out. Please try again.")
      setSigningOut(false)
    }
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-semibold text-2xl tracking-tight">My orders</h1>
          <p className="mt-1 text-muted-foreground text-sm">Signed in as {user.name}</p>
        </div>
        <Button variant="outline" size="sm" onClick={signOut} disabled={signingOut}>
          {signingOut ? <Spinner /> : <HugeiconsIcon icon={Logout01Icon} />}
          Sign out
        </Button>
      </div>

      {!orders?.length ? (
        <EmptyState
          icon={PackageIcon}
          title="No orders yet"
          description="When you place an order while signed in, it shows up here."
          action={
            <Link to="/products" className={buttonVariants()}>
              Start shopping
            </Link>
          }
        />
      ) : (
        <ul className="space-y-3">
          {orders.map((order) => {
            const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0)
            return (
              <li key={order.orderNumber}>
                <Link to="/orders/$orderNumber" params={{ orderNumber: order.orderNumber }} className="group block">
                  <Card className="transition-colors group-hover:bg-muted/40">
                    <CardContent className="space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="break-all font-mono text-xs">{order.orderNumber}</p>
                          <p className="text-muted-foreground text-xs">{formatDate(order.createdAt)}</p>
                        </div>
                        <OrderStatusBadge status={order.orderStatus} />
                      </div>
                      <div className="flex items-center gap-2">
                        {order.items
                          .slice(0, 4)
                          .map((item) =>
                            item.product.images[0] ? (
                              <img
                                key={item.id}
                                src={item.product.images[0]}
                                alt={item.product.name}
                                loading="lazy"
                                className="size-12 rounded-md bg-muted object-cover"
                              />
                            ) : (
                              <div key={item.id} className="size-12 rounded-md bg-muted" />
                            ),
                          )}
                        {order.items.length > 4 && (
                          <span className="text-muted-foreground text-xs">+{order.items.length - 4} more</span>
                        )}
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {itemCount} {itemCount === 1 ? 'item' : 'items'}
                        </span>
                        <span className="font-semibold tabular-nums">{money(order.total)}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
