'use client'

import { useCart } from '@/lib/store'
import Link from 'next/link'
import { ShopButton } from '@/components/ShopButton'
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  Package,
  Tag,
  ShoppingCart,
  ArrowRight,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
export default function CartPage() {
  const { items, removeItem, updateQuantity, total, clearCart } = useCart()

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto text-center shadow-lg">
          <CardContent className="pt-12 pb-8">
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                <ShoppingBag
                  className="w-12 h-12 text-primary"
                  strokeWidth={1.5}
                />
              </div>
            </div>
            <h1 className="text-2xl font-bold mb-2">{'Empty Cart'}</h1>
            <p className="text-muted-foreground mb-8 max-w-xs mx-auto">
              Your cart is empty. Start shopping and add your favorite products.
            </p>
            <Button asChild size="lg" className="min-w-[200px] gap-2 group">
              <Link href="/products">
                Start Shopping
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <TooltipProvider>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <ShoppingCart className="w-8 h-8 text-primary" />
              {'Your Cart'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {`${items.length} products • Total ${totalItems} items`}
            </p>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Trash2 className="w-4 h-4" />
                Clear All
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{'Clear Cart Title'}</AlertDialogTitle>
                <AlertDialogDescription>
                  {'Clear Cart Message'}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{'Cancel'}</AlertDialogCancel>
                <AlertDialogAction
                  onClick={clearCart}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  {'Yes Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => {
              const itemTotal = item.price * item.quantity
              const itemKey = `${item.productId}-${item.variantId || ''}`

              return (
                <Card
                  key={itemKey}
                  className="transition-all duration-300 hover:shadow-md"
                >
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Link
                        href={`/products/${item.productId}`}
                        className="relative w-full sm:w-28 h-32 sm:h-28 shrink-0 group overflow-hidden rounded-lg"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover border transition-all duration-300 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <Link
                              href={`/products/${item.productId}`}
                              className="hover:text-primary transition-colors group"
                            >
                              <h3 className="font-semibold text-base sm:text-lg mb-1 line-clamp-2 group-hover:underline">
                                {item.name}
                              </h3>
                            </Link>
                            {item.name && (
                              <p className="text-xs text-muted-foreground mb-1 line-clamp-1">
                                {item.name}
                              </p>
                            )}
                          </div>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  removeItem(item.productId, item.variantId)
                                }
                                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{'Remove Item'}</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          {item.variantName && (
                            <Badge variant="secondary" className="gap-1">
                              <Tag className="w-3 h-3" />
                              {item.variantName}
                            </Badge>
                          )}
                          <Badge
                            variant="outline"
                            className="gap-1 text-green-600 border-green-200 bg-green-50"
                          >
                            <Package className="w-3 h-3" />
                            {'In Stock'}
                          </Badge>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-4 sm:mt-0">
                          <div className="space-y-1.5">
                            <div className="flex items-baseline gap-2">
                              <span className="text-xs sm:text-sm text-muted-foreground">
                                Unit Price:
                              </span>
                              <span className="text-primary font-bold text-base sm:text-lg">
                                ৳{item.price.toLocaleString('en-US')}
                              </span>
                            </div>
                            <div className="flex items-baseline gap-2">
                              <span className="text-xs sm:text-sm text-muted-foreground">
                                Subtotal:
                              </span>
                              <span className="text-foreground font-bold text-lg sm:text-xl">
                                ৳{itemTotal.toLocaleString('en-US')}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 sm:gap-3">
                            <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                              {'Quantity'}:
                            </span>
                            <div className="flex items-center gap-0 border rounded-lg shadow-sm bg-background">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 hover:bg-muted rounded-r-none transition-colors"
                                    onClick={() =>
                                      updateQuantity(
                                        item.productId,
                                        Math.max(1, item.quantity - 1),
                                        item.variantId
                                      )
                                    }
                                    disabled={item.quantity <= 1}
                                  >
                                    <Minus className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Decrease</p>
                                </TooltipContent>
                              </Tooltip>
                              <div className="px-3 sm:px-4 text-sm sm:text-base font-semibold min-w-10 sm:min-w-12 text-center border-x">
                                {item.quantity}
                              </div>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 hover:bg-muted rounded-l-none transition-colors"
                                    onClick={() =>
                                      updateQuantity(
                                        item.productId,
                                        item.quantity + 1,
                                        item.variantId
                                      )
                                    }
                                  >
                                    <Plus className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Increase</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20 shadow-lg">
              <CardHeader className="bg-muted/50">
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-primary" />
                  Order Summary
                </CardTitle>
                <CardDescription>Your order details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-muted-foreground flex items-center gap-1">
                      {'Subtotal'}
                      <span className="text-xs">({`${totalItems} items`})</span>
                    </span>
                    <span className="font-semibold text-base">
                      ৳{total().toLocaleString('en-US')}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm items-start gap-2">
                    <span className="text-muted-foreground flex items-center gap-1">
                      Delivery Charge
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <AlertCircle className="w-3 h-3 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>{'Delivery Info'}</p>
                        </TooltipContent>
                      </Tooltip>
                    </span>
                    <span className="font-medium text-muted-foreground text-xs text-right">
                      Calculated at checkout
                    </span>
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between items-center bg-primary/5 -mx-6 px-6 py-4 rounded-lg">
                  <span className="font-semibold text-lg">{'Total'}</span>
                  <span className="font-bold text-2xl sm:text-3xl text-primary">
                    ৳{total().toLocaleString('en-US')}
                  </span>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
                  <Package className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-green-800">
                    All products are in stock and ready for delivery
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-3 pt-2">
                <ShopButton
                  href="/checkout"
                  variant="primary"
                  className="w-full gap-2 flex items-center justify-center py-3"
                >
                  {'Proceed To Checkout'}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </ShopButton>
                <ShopButton
                  href="/products"
                  variant="outline"
                  className="w-full gap-2 flex items-center justify-center"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Continue Shopping
                </ShopButton>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
