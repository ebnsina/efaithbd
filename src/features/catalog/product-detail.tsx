import { MinusSignIcon, PlusSignIcon, Share08Icon, ShoppingCart01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useMoney } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { getProduct } from './catalog.functions'
import { StoreIcon } from './icons'
import { imageSrc } from './image'
import { discountPercent, useAddToCart, WishlistButton } from './product-card'
import { Stars } from './stars'

type ProductData = Awaited<ReturnType<typeof getProduct>>

export function ProductGallery({ name, images }: { name: string; images: string[] }) {
  const [selected, setSelected] = useState(0)
  return (
    <div className="space-y-3">
      <div className="relative aspect-square overflow-hidden rounded-xl border bg-muted">
        {images[selected] && (
          <img
            src={imageSrc(images[selected], 900)}
            alt={name}
            width={900}
            height={900}
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 size-full object-contain"
          />
        )}
      </div>
      {images.length > 1 && (
        <ul className="flex gap-2 overflow-x-auto pb-1">
          {images.map((image, i) => (
            <li key={image} className="shrink-0">
              <button
                type="button"
                onClick={() => setSelected(i)}
                aria-label={`Show image ${i + 1}`}
                aria-current={i === selected}
                className={cn(
                  'size-16 overflow-hidden rounded-lg border-2 sm:size-20',
                  i === selected ? 'border-primary' : 'border-transparent hover:border-primary/40',
                )}
              >
                <img
                  src={imageSrc(image, 160)}
                  alt=""
                  width={80}
                  height={80}
                  loading="lazy"
                  decoding="async"
                  className="size-full object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

async function share(name: string) {
  const url = window.location.href
  try {
    if (navigator.share) return await navigator.share({ title: name, url })
    await navigator.clipboard.writeText(url)
    toast.success('Link copied')
  } catch (error) {
    if ((error as Error).name !== 'AbortError') toast.error('Could not share this product')
  }
}

export function PurchasePanel({ product, featureCards }: Pick<ProductData, 'product' | 'featureCards'>) {
  const money = useMoney()
  const router = useRouter()
  const addToCart = useAddToCart()
  const { variants } = product
  const [variantId, setVariantId] = useState(() => variants.find((v) => v.stock > 0)?.id ?? null)
  const [quantity, setQuantity] = useState(1)
  const variant = variants.find((v) => v.id === variantId)
  const price = product.price + (variant?.price ?? 0)
  const stock = variants.length > 0 ? (variant?.stock ?? 0) : product.stock
  const discount = discountPercent(product.price, product.comparePrice)
  const canBuy = stock > 0 && (variants.length === 0 || !!variant)

  const add = () =>
    addToCart({
      productId: product.id,
      name: product.name,
      price,
      quantity,
      image: product.images[0] ?? '',
      ...(variant && { variantId: variant.id, variantName: `${variant.name}: ${variant.value}` }),
    })

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <h1 className="font-bold text-2xl leading-tight md:text-3xl">{product.name}</h1>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          {product.reviewCount > 0 ? (
            <a href="#reviews" className="inline-flex items-center gap-1 hover:underline">
              <Stars value={product.rating} />
              <span className="text-muted-foreground">
                {product.rating.toFixed(1)} ({product.reviewCount})
              </span>
            </a>
          ) : (
            <span className="text-muted-foreground">No reviews yet</span>
          )}
          <span className={cn('font-medium', stock > 0 ? 'text-primary' : 'text-destructive')}>
            {stock > 0 ? (stock <= 5 ? `Only ${stock} left` : 'In stock') : 'Out of stock'}
          </span>
        </div>
      </div>

      <div>
        <div className="flex flex-wrap items-baseline gap-3">
          <span className="font-bold text-3xl text-primary">{money(price)}</span>
          {discount > 0 && product.comparePrice && (
            <span className="text-lg text-muted-foreground line-through">{money(product.comparePrice)}</span>
          )}
        </div>
        {discount > 0 && product.comparePrice && (
          <p className="mt-1 text-sm">
            You save {money(product.comparePrice - product.price)} ({discount}%)
          </p>
        )}
      </div>

      {variants.length > 0 && (
        <fieldset className="space-y-2">
          <legend className="mb-2 font-medium text-sm">Choose an option</legend>
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => (
              <button
                key={v.id}
                type="button"
                disabled={v.stock <= 0}
                aria-pressed={v.id === variantId}
                onClick={() => {
                  setVariantId(v.id)
                  setQuantity(1)
                }}
                className={cn(
                  'rounded-lg border-2 px-3 py-2 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50',
                  v.id === variantId ? 'border-primary bg-primary/10' : 'hover:border-primary/40',
                )}
              >
                <span className="block font-medium">{v.value}</span>
                {(v.price ?? 0) > 0 && <span className="block text-muted-foreground text-xs">+{money(v.price ?? 0)}</span>}
                {v.stock <= 0 && <span className="block text-destructive text-xs">Out of stock</span>}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {canBuy && (
        <div className="flex items-center gap-3">
          <span className="font-medium text-sm">Quantity</span>
          <div className="flex items-center rounded-lg border">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Decrease quantity"
              disabled={quantity <= 1}
              onClick={() => setQuantity((q) => q - 1)}
            >
              <HugeiconsIcon icon={MinusSignIcon} />
            </Button>
            <output className="w-10 text-center font-semibold" aria-live="polite">
              {quantity}
            </output>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Increase quantity"
              disabled={quantity >= stock}
              onClick={() => setQuantity((q) => q + 1)}
            >
              <HugeiconsIcon icon={PlusSignIcon} />
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          size="lg"
          className="h-11 flex-1"
          disabled={!canBuy}
          onClick={() => {
            add()
            router.navigate({ to: '/checkout' })
          }}
        >
          Buy now
        </Button>
        <Button size="lg" variant="outline" className="h-11 flex-1" disabled={!canBuy} onClick={add}>
          <HugeiconsIcon icon={ShoppingCart01Icon} />
          Add to cart
        </Button>
      </div>
      <div className="flex gap-2">
        <WishlistButton
          item={{
            productId: product.id,
            name: product.name,
            price: product.price,
            image: product.images[0] ?? '',
            slug: product.slug,
          }}
        />
        <Button variant="outline" size="icon" className="rounded-full" aria-label="Share" onClick={() => share(product.name)}>
          <HugeiconsIcon icon={Share08Icon} />
        </Button>
      </div>

      {featureCards.length > 0 && (
        <ul className="space-y-2 border-t pt-4 text-sm">
          {featureCards.map((card) => (
            <li key={card.id} className="flex items-center gap-3">
              <StoreIcon value={card.icon} className="size-5 shrink-0 text-primary" />
              <span>
                <span className="font-medium">{card.title}</span>
                {card.description && <span className="text-muted-foreground"> · {card.description}</span>}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
