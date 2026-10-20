import { Delete02Icon, FavouriteIcon, ShoppingCart01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { createFileRoute, Link, useHydrated, useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState, RoutePending } from '@/features/pages/route-states'
import { useMoney } from '@/lib/format'
import { type WishlistItem, useCart, useWishlist } from '@/lib/store'

export const Route = createFileRoute('/_shop/wishlist')({
  head: () => ({ meta: [{ title: 'Wishlist' }, { name: 'robots', content: 'noindex' }] }),
  component: WishlistPage,
})

function WishlistPage() {
  const hydrated = useHydrated()
  const money = useMoney()
  const { items, removeItem } = useWishlist()
  const addToCart = useCart((state) => state.addItem)
  const navigate = useNavigate()

  if (!hydrated) return <RoutePending />

  if (items.length === 0) {
    return (
      <main className="container mx-auto max-w-2xl px-4 py-12">
        <EmptyState
          icon={FavouriteIcon}
          title="Your wishlist is empty"
          description="Tap the heart on any product to save it here for later."
          action={
            <Link to="/products" className={buttonVariants()}>
              Browse products
            </Link>
          }
        />
      </main>
    )
  }

  const moveToCart = (item: WishlistItem) => {
    addToCart({ productId: item.productId, name: item.name, price: item.price, image: item.image, quantity: 1 })
    toast.success(`${item.name} added to your cart`, {
      action: { label: 'View cart', onClick: () => navigate({ to: '/cart' }) },
    })
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="font-semibold text-2xl tracking-tight">Wishlist</h1>
      <p className="mt-1 mb-6 text-muted-foreground text-sm">
        {items.length} saved {items.length === 1 ? 'product' : 'products'}
      </p>
      <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <li key={item.productId}>
            <Card className="h-full gap-0 overflow-hidden py-0">
              <Link to="/products/$slug" params={{ slug: item.slug }} className="block aspect-square bg-muted">
                {item.image && <img src={item.image} alt="" loading="lazy" className="size-full object-cover" />}
              </Link>
              <CardContent className="flex flex-1 flex-col gap-2 p-3">
                <Link
                  to="/products/$slug"
                  params={{ slug: item.slug }}
                  className="line-clamp-2 font-medium text-sm hover:underline"
                >
                  {item.name}
                </Link>
                <p className="font-semibold tabular-nums">{money(item.price)}</p>
                <div className="mt-auto flex gap-2">
                  <Button size="sm" className="flex-1" onClick={() => moveToCart(item)}>
                    <HugeiconsIcon icon={ShoppingCart01Icon} />
                    Add to cart
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="outline"
                    aria-label={`Remove ${item.name} from wishlist`}
                    onClick={() => removeItem(item.productId)}
                  >
                    <HugeiconsIcon icon={Delete02Icon} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </main>
  )
}
