import { useQuery } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { useMoney } from '@/lib/format'
import { adminOrderQuery, useUpdateOrder } from './queries'
import {
  type OrderStatus,
  orderStatusLabels,
  type PaymentStatus,
  paymentMethodLabels,
  paymentStatusLabels,
  toOptions,
} from './status'

const orderStatusOptions = toOptions(orderStatusLabels)
const paymentStatusOptions = toOptions(paymentStatusLabels)
const dateTime = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export function OrderSheet({ orderId, onClose }: { orderId?: string; onClose: () => void }) {
  return (
    <Sheet open={!!orderId} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="gap-0 overflow-y-auto data-[side=right]:w-full data-[side=right]:sm:max-w-lg">
        {orderId && <OrderDetails id={orderId} />}
      </SheetContent>
    </Sheet>
  )
}

function OrderDetails({ id }: { id: string }) {
  const money = useMoney()
  const order = useQuery(adminOrderQuery(id))
  const update = useUpdateOrder()

  if (order.isPending) {
    return (
      <div className="space-y-4 p-6">
        <SheetTitle className="sr-only">Loading order</SheetTitle>
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-24" />
        <Skeleton className="h-40" />
      </div>
    )
  }

  if (order.isError || !order.data) {
    return (
      <div className="flex flex-col items-center gap-4 p-6 pt-16 text-center">
        <SheetTitle>{order.isError ? 'Could not load this order' : 'Order not found'}</SheetTitle>
        <SheetDescription>
          {order.isError ? 'Please check your connection and try again.' : 'It may have been removed.'}
        </SheetDescription>
        {order.isError && (
          <Button variant="outline" onClick={() => order.refetch()}>
            Try again
          </Button>
        )}
      </div>
    )
  }

  const o = order.data
  return (
    <>
      <SheetHeader className="border-b">
        <SheetTitle>Order {o.orderNumber}</SheetTitle>
        <SheetDescription>Placed {dateTime.format(new Date(o.createdAt))}</SheetDescription>
      </SheetHeader>

      <div className="space-y-6 p-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="order-status">Order status</Label>
            <Select
              items={orderStatusOptions}
              value={o.orderStatus}
              onValueChange={(value) => value && update.mutate({ id, orderStatus: value as OrderStatus })}
            >
              <SelectTrigger id="order-status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {orderStatusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="payment-status">Payment</Label>
            <Select
              items={paymentStatusOptions}
              value={o.paymentStatus}
              onValueChange={(value) => value && update.mutate({ id, paymentStatus: value as PaymentStatus })}
            >
              <SelectTrigger id="payment-status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {paymentStatusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Section title="Customer">
          <Row label="Name">{o.customerName}</Row>
          <Row label="Phone">
            <a href={`tel:${o.customerPhone}`} className="underline-offset-4 hover:underline">
              {o.customerPhone}
            </a>
          </Row>
          <Row label="Address">
            <span className="whitespace-pre-line">{o.customerAddress}</span>
          </Row>
          {o.notes && (
            <Row label="Note">
              <span className="whitespace-pre-line">{o.notes}</span>
            </Row>
          )}
        </Section>

        <Section title={`Items (${o.items.length})`}>
          {o.items.length === 0 ? (
            <p className="text-muted-foreground">No items on this order.</p>
          ) : (
            <ul className="divide-y">
              {o.items.map((item) => (
                <li key={item.id} className="flex items-center gap-3 py-2 first:pt-0 last:pb-0">
                  {item.product.images[0] ? (
                    <img src={item.product.images[0]} alt="" className="size-10 rounded-md object-cover" />
                  ) : (
                    <div className="size-10 rounded-md bg-muted" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">{item.product.name}</div>
                    <div className="text-muted-foreground text-xs">
                      {item.variant && `${item.variant.name}: ${item.variant.value} · `}
                      {money(item.price)} × {item.quantity}
                    </div>
                  </div>
                  <div className="font-medium tabular-nums">{money(item.total)}</div>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Summary">
          <Row label="Subtotal">{money(o.subtotal)}</Row>
          {o.discount > 0 && (
            <Row label="Discount">
              −{money(o.discount)}
              {o.coupon && (
                <Badge variant="outline" className="ml-2">
                  {o.coupon.code}
                </Badge>
              )}
            </Row>
          )}
          <Row label={o.shippingMethod ? `Delivery (${o.shippingMethod.name})` : 'Delivery'}>{money(o.shippingCost)}</Row>
          <Separator />
          <Row label="Total">
            <span className="font-semibold">{money(o.total)}</span>
          </Row>
        </Section>

        <Section title="Payment">
          <Row label="Method">{paymentMethodLabels[o.paymentMethod]}</Row>
          {o.bkashNumber && <Row label="bKash number">{o.bkashNumber}</Row>}
          {o.bkashTrxId && (
            <Row label="Transaction ID">
              <span className="font-mono">{o.bkashTrxId}</span>
            </Row>
          )}
        </Section>
      </div>
    </>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-2">
      <h3 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">{title}</h3>
      <div className="space-y-2 rounded-lg border p-3">{children}</div>
    </section>
  )
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="text-right">{children}</span>
    </div>
  )
}
