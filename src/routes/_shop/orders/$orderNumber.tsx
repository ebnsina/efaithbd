import { CheckmarkCircle02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link, notFound, stripSearchParams } from '@tanstack/react-router'
import * as v from 'valibot'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { variantLabel } from '@/features/checkout/pricing'
import { orderQuery } from '@/features/orders/queries'
import { OrderStatusBadge, paymentLabel, paymentStatusLabel } from '@/features/orders/status'
import { RouteError, RoutePending } from '@/features/pages/route-states'
import { formatDate, useMoney } from '@/lib/format'

export const Route = createFileRoute('/_shop/orders/$orderNumber')({
  validateSearch: v.object({ placed: v.optional(v.fallback(v.boolean(), false), false) }),
  search: { middlewares: [stripSearchParams({ placed: false })] },
  loader: async ({ context, params }) => {
    const order = await context.queryClient.ensureQueryData(orderQuery(params.orderNumber))
    if (!order) throw notFound()
  },
  head: ({ params }) => ({ meta: [{ title: `Order ${params.orderNumber}` }, { name: 'robots', content: 'noindex' }] }),
  pendingComponent: RoutePending,
  errorComponent: RouteError,
  component: OrderPage,
})

function OrderPage() {
  const { orderNumber } = Route.useParams()
  const { placed } = Route.useSearch()
  const money = useMoney()
  const { data: order } = useSuspenseQuery(orderQuery(orderNumber))
  if (!order) return null

  return (
    <div className="container mx-auto max-w-3xl space-y-6 px-4 py-10">
      {placed ? (
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-8" />
          </div>
          <h1 className="font-semibold text-2xl tracking-tight">Thank you, your order is placed</h1>
          <p className="max-w-md text-muted-foreground">
            We'll call you to confirm it soon. You can check on it any time from{' '}
            <Link to="/orders/track" className="font-medium text-foreground underline underline-offset-4">
              Track order
            </Link>{' '}
            with the phone number ending in {order.customerPhone.slice(-4)}.
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-semibold text-2xl tracking-tight">Order details</h1>
          <OrderStatusBadge status={order.orderStatus} />
        </div>
      )}

      <Card>
        <CardContent className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <Fact label="Order number" value={<span className="break-all font-mono text-xs">{order.orderNumber}</span>} />
          <Fact label="Placed on" value={formatDate(order.createdAt)} />
          <Fact label="Status" value={<OrderStatusBadge status={order.orderStatus} />} />
          <Fact
            label="Payment"
            value={`${paymentLabel(order.paymentMethod)} · ${paymentStatusLabel(order.paymentStatus)}`}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-3">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center gap-3">
                {item.product.images[0] ? (
                  <img src={item.product.images[0]} alt="" className="size-14 shrink-0 rounded-md bg-muted object-cover" />
                ) : (
                  <div className="size-14 shrink-0 rounded-md bg-muted" />
                )}
                <div className="min-w-0 flex-1">
                  <Link
                    to="/products/$slug"
                    params={{ slug: item.product.slug }}
                    className="line-clamp-2 font-medium text-sm hover:underline"
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-muted-foreground text-xs">
                    {item.variant && `${variantLabel(item.variant)} · `}
                    {item.quantity} × {money(item.price)}
                  </p>
                </div>
                <span className="font-medium text-sm tabular-nums">{money(item.total)}</span>
              </li>
            ))}
          </ul>
          <Separator />
          <dl className="space-y-2 text-sm">
            <Row label="Subtotal" value={money(order.subtotal)} />
            {order.discount > 0 && <Row label="Discount" value={`−${money(order.discount)}`} />}
            <Row
              label={order.shippingMethod ? `Delivery (${order.shippingMethod.name})` : 'Delivery'}
              value={money(order.shippingCost)}
            />
            <Separator />
            <Row label="Total" value={money(order.total)} strong />
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Delivery</CardTitle>
        </CardHeader>
        <CardContent className="gap-1 text-sm">
          <p className="font-medium">{order.customerName}</p>
          <p className="text-muted-foreground">{order.customerPhone}</p>
          {order.customerAddress ? (
            <p className="whitespace-pre-line text-muted-foreground">{order.customerAddress}</p>
          ) : (
            <p className="text-muted-foreground text-xs">
              The full address is only shown to the account that placed this order.
            </p>
          )}
        </CardContent>
      </Card>

      {placed && order.isGuestOrder && (
        <Card className="bg-muted/50">
          <CardContent className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <p className="font-medium">Save time next time</p>
              <p className="text-muted-foreground text-sm">Create an account to keep all your orders in one place.</p>
            </div>
            <Link to="/register" className={buttonVariants({ variant: 'outline' })}>
              Create an account
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <Link to="/products" className={buttonVariants()}>
          Continue shopping
        </Link>
        {order.isOwner && (
          <Link to="/orders" className={buttonVariants({ variant: 'outline' })}>
            All my orders
          </Link>
        )}
      </div>
    </div>
  )
}

function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-muted-foreground text-xs">{label}</p>
      <div className="font-medium">{value}</div>
    </div>
  )
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex justify-between gap-4 ${strong ? 'font-semibold text-base' : ''}`}>
      <dt className={strong ? '' : 'text-muted-foreground'}>{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  )
}
