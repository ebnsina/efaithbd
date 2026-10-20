import { FavouriteIcon, ShoppingCart01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Link, useHydrated, useRouter } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { siteSettingsQuery } from '@/features/settings/queries'
import { useMoney } from '@/lib/format'
import { type CartItem, useCart, useWishlist, type WishlistItem } from '@/lib/store'
import { cn } from '@/lib/utils'
import type { ProductCardData } from './catalog.functions'
import { imageSrc } from './image'
import { Stars } from './stars'

export const discountPercent = (price: number, comparePrice: number | null) =>
  comparePrice && comparePrice > price ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0

export function useAddToCart() {
  const router = useRouter()
  const addItem = useCart((state) => state.addItem)
  return (item: CartItem) => {
    addItem(item)
    toast.success('Added to cart', {
      description: `${item.name}${item.variantName ? ` (${item.variantName})` : ''} × ${item.quantity}`,
      action: { label: 'View cart', onClick: () => router.navigate({ to: '/cart' }) },
    })
  }
}

export function WishlistButton({ item, className }: { item: WishlistItem; className?: string }) {
  const hydrated = useHydrated()
  const { data: settings } = useSuspenseQuery(siteSettingsQuery)
  const saved = useWishlist((state) => state.items.some((i) => i.productId === item.productId))
  const { addItem, removeItem } = useWishlist()
  if (settings && !settings.enableWishlist) return null
  const active = hydrated && saved
  return (
    <Button
      variant="outline"
      size="icon"
      className={cn('rounded-full', active && 'border-primary text-primary', className)}
      aria-pressed={active}
      aria-label={active ? `Remove ${item.name} from wishlist` : `Save ${item.name} to wishlist`}
      onClick={() => {
        if (active) {
          removeItem(item.productId)
          toast.success('Removed from wishlist')
        } else {
          addItem(item)
          toast.success('Saved to wishlist')
        }
      }}
    >
      <HugeiconsIcon icon={FavouriteIcon} fill={active ? 'currentColor' : 'none'} />
    </Button>
  )
}

export function ProductCard({ product }: { product: ProductCardData }) {
  const money = useMoney()
  const addToCart = useAddToCart()
  const discount = discountPercent(product.price, product.comparePrice)
  const soldOut = product.stock <= 0

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border bg-card">
      <Link to="/products/$slug" params={{ slug: product.slug }} className="relative block aspect-square bg-muted">
        {product.image && (
          <img
            src={imageSrc(product.image, 480)}
            alt={product.name}
            width={480}
            height={480}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        )}
        {discount > 0 && <Badge className="absolute top-2 left-2">−{discount}%</Badge>}
        {soldOut && (
          <span className="absolute inset-0 flex items-center justify-center bg-background/70 font-medium text-sm">
            Out of stock
          </span>
        )}
      </Link>
      <WishlistButton
        className="absolute top-2 right-2 size-8 bg-background/90"
        item={{
          productId: product.id,
          name: product.name,
          price: product.price,
          image: product.image ?? '',
          slug: product.slug,
        }}
      />
      <div className="flex flex-1 flex-col gap-2 p-3">
        <Link
          to="/products/$slug"
          params={{ slug: product.slug }}
          className="line-clamp-2 min-h-10 font-medium text-sm leading-snug hover:underline"
        >
          {product.name}
        </Link>
        {product.reviewCount > 0 && (
          <div className="flex items-center gap-1 text-muted-foreground text-xs">
            <Stars value={product.rating} className="text-sm" />
            <span>({product.reviewCount})</span>
          </div>
        )}
        <div className="mt-auto flex flex-wrap items-baseline gap-x-2">
          <span className="font-semibold">{money(product.price)}</span>
          {discount > 0 && product.comparePrice && (
            <span className="text-muted-foreground text-sm line-through">{money(product.comparePrice)}</span>
          )}
        </div>
        {soldOut ? (
          <Button variant="outline" disabled className="w-full">
            Out of stock
          </Button>
        ) : product.hasVariants ? (
          <Link
            to="/products/$slug"
            params={{ slug: product.slug }}
            className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}
          >
            Choose options
          </Link>
        ) : (
          <Button
            variant="outline"
            className="w-full"
            onClick={() =>
              addToCart({
                productId: product.id,
                name: product.name,
                price: product.price,
                quantity: 1,
                image: product.image ?? '',
              })
            }
          >
            <HugeiconsIcon icon={ShoppingCart01Icon} />
            Add to cart
          </Button>
        )}
      </div>
    </article>
  )
}

export function ProductGrid({ products }: { products: ProductCardData[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
