'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/store'
import { ShoppingBag, ShoppingCart, X } from 'lucide-react'
import { ShopButton } from './ShopButton'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { toast } from 'sonner'

interface ProductCardProps {
  product: {
    id: string
    name: string
    slug: string
    price: number
    comparePrice: number | null
    images: string[]
    stock: number
    variants?: Array<{
      id: string
      name: string
      value: string
      price: number | null
      stock: number
    }>
  }
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter()
  const { addItem } = useCart()
  const [showVariantDialog, setShowVariantDialog] = useState(false)
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)

  const hasVariants = product.variants && product.variants.length > 0

  const selectedVariantData = product.variants?.find(
    v => v.id === selectedVariant
  )

  const currentPrice = selectedVariantData?.price
    ? product.price + selectedVariantData.price
    : product.price

  const handleAddToCart = () => {
    if (hasVariants) {
      setShowVariantDialog(true)
      return
    }

    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images[0] || '/placeholder.jpg',
    })

    toast.success('Product added to cart!', {
      description: `${product.name} (1)`,
    })
  }

  const handleVariantAddToCart = () => {
    if (!selectedVariant) {
      toast.error('Please select a variant')
      return
    }

    addItem({
      productId: product.id,
      name: product.name,
      price: currentPrice,
      quantity,
      image: product.images[0] || '/placeholder.jpg',
      ...(selectedVariantData && {
        variantId: selectedVariantData.id,
        variantName: `${selectedVariantData.name}: ${selectedVariantData.value}`,
      }),
    })

    const variantName = selectedVariantData ? selectedVariantData.value : ''

    toast.success('Product added to cart!', {
      description: `${product.name}${
        selectedVariantData ? ` - ${variantName}` : ''
      } (${quantity})`,
    })

    setShowVariantDialog(false)
    setSelectedVariant(null)
    setQuantity(1)
  }

  const handleBuyNow = () => {
    if (hasVariants && !selectedVariant) {
      toast.error('Please select a variant')
      return
    }

    if (hasVariants && selectedVariant) {
      handleVariantAddToCart()
    }

    router.push('/checkout')
  }

  const discount = product.comparePrice
    ? Math.round(
        ((product.comparePrice - product.price) / product.comparePrice) * 100
      )
    : 0

  return (
    <>
      <div className="border border-slate-200 overflow-hidden">
        <Link href={`/products/${product.slug}`}>
          <div className="shop-image-wrapper relative aspect-square">
            <img
              src={product.images[0] || '/placeholder.jpg'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {discount > 0 && (
              <Badge className="absolute top-3 right-3">-{discount}%</Badge>
            )}
            {product.stock === 0 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                <span className="bg-black/80 rounded-lg px-4 py-2 text-white font-semibold text-sm">
                  Out of Stock
                </span>
              </div>
            )}
          </div>
        </Link>
        <div className="p-4">
          <Link href={`/products/${product.slug}`}>
            <h3 className="font-semibold text-lg mb-2 line-clamp-2 h-10 text-gray-900 hover:underline transition-all leading-snug">
              {product.name}
            </h3>
          </Link>
          <div className="mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-lg font-medium">
                ৳{product.price.toLocaleString('en-US')}
              </span>
              {product.comparePrice && (
                <span className="text-base font-medium line-through">
                  ৳{product.comparePrice.toLocaleString('en-US')}
                </span>
              )}
            </div>
          </div>
          <div className="space-y-2 gap-1">
            {hasVariants ? (
              <>
                <ShopButton
                  href={`/products/${product.slug}`}
                  variant="primary"
                  disabled={product.stock === 0}
                  className="flex space-x-2 items-center justify-center w-full"
                >
                  <ShoppingBag className="size-4" />
                  <span>Buy Now</span>
                </ShopButton>
                <ShopButton
                  variant="outline"
                  onClick={() => setShowVariantDialog(true)}
                  disabled={product.stock === 0}
                  className="w-full"
                >
                  Choose Options
                </ShopButton>
              </>
            ) : (
              <>
                <ShopButton
                  href={`/products/${product.slug}`}
                  variant="primary"
                  disabled={product.stock === 0}
                  className="flex space-x-2 items-center justify-center w-full"
                >
                  <ShoppingBag className="size-4" />
                  <span>Buy Now</span>
                </ShopButton>
                <ShopButton
                  variant="outline"
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="w-full"
                >
                  Add to Cart
                </ShopButton>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Variant Selection Dialog */}
      <Dialog open={showVariantDialog} onOpenChange={setShowVariantDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{product.name}</DialogTitle>
            <DialogDescription>Select Variant</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Product Image */}
            <div className="flex gap-4">
              <img
                src={product.images[0] || '/placeholder.jpg'}
                alt={product.name}
                className="w-24 h-24 object-cover rounded-lg"
              />
              <div>
                <h4 className="font-semibold">{product.name}</h4>
                <p className="text-lg font-bold text-primary mt-1">
                  ৳{currentPrice.toLocaleString('en-US')}
                </p>
              </div>
            </div>

            {/* Variant Selection */}
            <div>
              <h4 className="text-sm font-semibold mb-2">Select Variant:</h4>
              <div className="grid grid-cols-2 gap-2">
                {product.variants?.map(variant => (
                  <Button
                    key={variant.id}
                    variant="outline"
                    onClick={() => setSelectedVariant(variant.id)}
                    disabled={variant.stock === 0}
                    className={`h-auto py-3 ${
                      selectedVariant === variant.id
                        ? 'border-primary bg-primary/10 text-primary border-2'
                        : variant.stock === 0
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                    }`}
                  >
                    <div className="text-center">
                      <div className="font-medium">{variant.value}</div>
                      {variant.price !== null && variant.price > 0 && (
                        <div className="text-xs text-muted-foreground">
                          +৳{variant.price}
                        </div>
                      )}
                      {variant.stock === 0 && (
                        <div className="text-xs text-red-500">Out of Stock</div>
                      )}
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <h4 className="text-sm font-semibold mb-2">Quantity:</h4>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="h-10 w-10"
                >
                  -
                </Button>
                <span className="w-12 text-center font-semibold">
                  {quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={
                    quantity >= (selectedVariantData?.stock || product.stock)
                  }
                  className="h-10 w-10"
                >
                  +
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <ShopButton
                variant="outline"
                onClick={() => {
                  setShowVariantDialog(false)
                  setSelectedVariant(null)
                  setQuantity(1)
                }}
                className="flex-1"
              >
                Cancel
              </ShopButton>
              <ShopButton
                variant="primary"
                onClick={handleVariantAddToCart}
                disabled={!selectedVariant}
                className="flex-1"
              >
                Add to Cart
              </ShopButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
