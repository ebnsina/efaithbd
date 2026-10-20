import { Delete02Icon, MinusSignIcon, PlusSignIcon, ShoppingCart01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { createFileRoute, Link, useHydrated } from '@tanstack/react-router'
import { useState } from 'react'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { EmptyState, RoutePending } from '@/features/pages/route-states'
import { useMoney } from '@/lib/format'
import { useCart } from '@/lib/store'

export const Route = createFileRoute('/_shop/cart')({
  head: () => ({ meta: [{ title: 'Your cart' }, { name: 'robots', content: 'noindex' }] }),
  component: CartPage,
})

function CartPage() {
  const hydrated = useHydrated()
  const money = useMoney()
  const { items, removeItem, updateQuantity, clearCart } = useCart()
  const [confirmClear, setConfirmClear] = useState(false)

  // The cart lives in this browser only, so the server render can't know it
  if (!hydrated) return <RoutePending />

  if (items.length === 0) {
    return (
      <main className="container mx-auto max-w-2xl px-4 py-12">
        <EmptyState
          icon={ShoppingCart01Icon}
          title="Your cart is empty"
          description="Browse the shop and add the things you like."
          action={
            <Link to="/products" className={buttonVariants()}>
              Start shopping
            </Link>
          }
        />
      </main>
    )
  }

  const count = items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="font-semibold text-2xl tracking-tight">Your cart</h1>
          <p className="mt-1 text-muted-foreground text-sm">
            {count} {count === 1 ? 'item' : 'items'}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setConfirmClear(true)}>
          <HugeiconsIcon icon={Delete02Icon} />
          Empty cart
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <ul className="space-y-3 lg:col-span-2">
          {items.map((item) => (
            <li key={`${item.productId}-${item.variantId ?? ''}`}>
              <Card className="py-0">
                <CardContent className="flex-row gap-4 p-4">
                  {item.image ? (
                    <img src={item.image} alt="" className="size-20 shrink-0 rounded-md bg-muted object-cover sm:size-24" />
                  ) : (
                    <div className="size-20 shrink-0 rounded-md bg-muted sm:size-24" />
                  )}
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="line-clamp-2 font-medium">{item.name}</p>
                        {item.variantName && (
                          <Badge variant="secondary" className="mt-1">
                            {item.variantName}
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Remove ${item.name}`}
                        onClick={() => removeItem(item.productId, item.variantId)}
                      >
                        <HugeiconsIcon icon={Delete02Icon} />
                      </Button>
                    </div>
                    <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center rounded-md border">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="One less"
                          disabled={item.quantity <= 1}
                          onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantId)}
                        >
                          <HugeiconsIcon icon={MinusSignIcon} />
                        </Button>
                        <span className="w-8 text-center text-sm tabular-nums" aria-live="polite">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="One more"
                          disabled={item.quantity >= 999}
                          onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)}
                        >
                          <HugeiconsIcon icon={PlusSignIcon} />
                        </Button>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold tabular-nums">{money(item.price * item.quantity)}</p>
                        {item.quantity > 1 && (
                          <p className="text-muted-foreground text-xs tabular-nums">{money(item.price)} each</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>

        <Card className="h-fit lg:sticky lg:top-20">
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium tabular-nums">{money(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery</span>
              <span className="text-muted-foreground">Worked out at checkout</span>
            </div>
            <Separator />
            <p className="text-muted-foreground text-xs">
              Prices and stock are checked again when you place your order.
            </p>
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <Link to="/checkout" className={buttonVariants({ className: 'w-full', size: 'lg' })}>
              Go to checkout
            </Link>
            <Link to="/products" className={buttonVariants({ variant: 'outline', className: 'w-full' })}>
              Keep shopping
            </Link>
          </CardFooter>
        </Card>
      </div>

      <ConfirmDialog
        open={confirmClear}
        onOpenChange={setConfirmClear}
        title="Empty your cart?"
        description="All items will be removed from your cart."
        confirmLabel="Empty cart"
        onConfirm={() => {
          clearCart()
          setConfirmClear(false)
        }}
      />
    </main>
  )
}
