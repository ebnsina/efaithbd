'use client'

import { useState } from 'react'
import { useWishlist } from '@/lib/store'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, ShoppingCart, Trash2 } from 'lucide-react'
import { useCart } from '@/lib/store'
import { ShopButton } from '@/components/ShopButton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export default function WishlistPage() {
  const { items, removeItem } = useWishlist()
  const { addItem } = useCart()
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean
    title: string
    message: string
  }>({ isOpen: false, title: '', message: '' })

  const handleAddToCart = (item: (typeof items)[0]) => {
    addItem({
      productId: item.productId,
      name: item.name,
      price: item.price,
      quantity: 1,
      image: item.image,
    })
    setDialogState({
      isOpen: true,
      title: 'Success',
      message: 'Added To Cart',
    })
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-lg shadow-sm p-12">
              <Heart className="w-24 h-24 mx-auto text-gray-300 mb-6" />
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {'Empty Wishlist'}
              </h1>
              <p className="text-gray-600 mb-8">{'Wishlist Message'}</p>
              <ShopButton
                href="/products"
                variant="primary"
                className="inline-block px-8"
              >
                {'Start Shopping'}
              </ShopButton>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {'Wishlist'}
          </h1>
          <p className="text-gray-600">
            {`${items.length} ${items.length === 1 ? 'product' : 'products'}`}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map(item => (
            <div
              key={item.productId}
              className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition group"
            >
              <Link
                href={`/products/${item.slug}`}
                className="block relative aspect-square bg-gray-100"
              >
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </Link>

              <div className="p-4">
                <Link
                  href={`/products/${item.slug}`}
                  className="block mb-2 hover:text-primary"
                >
                  <h3 className="font-semibold text-gray-900 line-clamp-2 min-h-12">
                    {item.name}
                  </h3>
                </Link>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-primary">
                    ৳{item.price.toLocaleString('en-US')}
                  </span>
                </div>

                <div className="flex gap-2">
                  <ShopButton
                    onClick={() => handleAddToCart(item)}
                    variant="primary"
                    className="py-2 px-4 flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {'Add to Cart'}
                  </ShopButton>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="bg-red-50 text-red-600 py-2 px-4 rounded-lg hover:bg-red-100 transition"
                    title={'Remove Item'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alert Dialog */}
      <Dialog
        open={dialogState.isOpen}
        onOpenChange={open =>
          !open && setDialogState({ ...dialogState, isOpen: false })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogState.title}</DialogTitle>
            <DialogDescription>{dialogState.message}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => setDialogState({ ...dialogState, isOpen: false })}
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
