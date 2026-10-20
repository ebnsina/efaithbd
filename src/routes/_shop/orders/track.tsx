import { PackageIcon, Search01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useAppForm } from '@/components/form'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { trackOrdersQuery } from '@/features/orders/queries'
import { trackSchema } from '@/features/orders/schemas'
import { OrderStatusBadge, paymentLabel, paymentStatusLabel } from '@/features/orders/status'
import { EmptyState } from '@/features/pages/route-states'
import { formatDate, useMoney } from '@/lib/format'

export const Route = createFileRoute('/_shop/orders/track')({
  head: () => ({
    meta: [
      { title: 'Track your order' },
      { name: 'description', content: 'Check the status of your orders with the phone number you ordered with.' },
    ],
  }),
  component: TrackPage,
})

function TrackPage() {
  const money = useMoney()
  // Kept out of the URL so phone numbers don't end up in browser history or server logs
  const [phone, setPhone] = useState('')
  const orders = useQuery({ ...trackOrdersQuery(phone), enabled: !!phone })
  const form = useAppForm({
    defaultValues: { phone: '' },
    validators: { onSubmit: trackSchema },
    onSubmit: ({ value }) => setPhone(value.phone.trim()),
  })

  return (
    <main className="container mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-semibold text-2xl tracking-tight">Track your order</h1>
      <p className="mt-1 mb-6 text-muted-foreground">Enter the phone number you used when ordering.</p>

      <Card>
        <CardContent>
          <form
            method="post"
            noValidate
            className="flex flex-col gap-3 sm:flex-row sm:items-start"
            onSubmit={(e) => {
              e.preventDefault()
              form.handleSubmit()
            }}
          >
            <div className="flex-1">
              <form.AppField name="phone">
                {(field) => (
                  <field.TextField
                    label="Phone number"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    placeholder="01XXXXXXXXX"
                    maxLength={11}
                  />
                )}
              </form.AppField>
            </div>
            <Button type="submit" className="sm:mt-[1.6rem]" disabled={orders.isFetching}>
              <HugeiconsIcon icon={Search01Icon} />
              Find orders
            </Button>
          </form>
        </CardContent>
      </Card>

      <section className="mt-6" aria-live="polite">
        {!phone ? null : orders.isPending ? (
          <div className="space-y-3">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : orders.isError ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 text-center">
              <p className="text-muted-foreground">We couldn't look up your orders right now.</p>
              <Button variant="outline" onClick={() => orders.refetch()}>
                Try again
              </Button>
            </CardContent>
          </Card>
        ) : orders.data.length === 0 ? (
          <EmptyState
            icon={PackageIcon}
            title="No orders found"
            description={`We couldn't find any orders for ${phone}. Check the number and try again.`}
          />
        ) : (
          <>
            <h2 className="mb-3 font-medium">
              {orders.data.length} {orders.data.length === 1 ? 'order' : 'orders'} found
            </h2>
            <ul className="space-y-3">
              {orders.data.map((order) => (
                <li key={order.orderNumber}>
                  <Card>
                    <CardContent className="space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="break-all font-mono text-xs">{order.orderNumber}</p>
                          <p className="text-muted-foreground text-xs">{formatDate(order.createdAt)}</p>
                        </div>
                        <OrderStatusBadge status={order.orderStatus} />
                      </div>
                      <div className="flex flex-wrap items-end justify-between gap-2 text-sm">
                        <div className="text-muted-foreground">
                          <p>
                            {order._count.items} {order._count.items === 1 ? 'product' : 'products'} ·{' '}
                            {paymentLabel(order.paymentMethod)} · {paymentStatusLabel(order.paymentStatus)}
                          </p>
                          <Link
                            to="/orders/$orderNumber"
                            params={{ orderNumber: order.orderNumber }}
                            className="font-medium text-foreground underline-offset-4 hover:underline"
                          >
                            View details
                          </Link>
                        </div>
                        <span className="font-semibold tabular-nums">{money(order.total)}</span>
                      </div>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </main>
  )
}
