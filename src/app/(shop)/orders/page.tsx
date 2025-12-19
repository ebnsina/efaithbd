import { ShopButton } from '@/components/ShopButton'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ChevronRight, Package } from 'lucide-react'
import { redirect } from 'next/navigation'

export default async function OrdersPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  // Get user details for phone matching
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { phone: true, name: true },
  })

  // Find orders by userId OR by matching phone/name for orders placed before login
  const orders = await prisma.order.findMany({
    where: {
      OR: [
        { userId: session.user.id },
        ...(user?.phone
          ? [
              {
                customerPhone: user.phone,
                customerName: user.name,
              },
            ]
          : []),
      ],
    },
    include: {
      items: {
        include: {
          product: true,
          variant: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'default'
      case 'CONFIRMED':
      case 'PROCESSING':
      case 'SHIPPED':
        return 'secondary'
      case 'CANCELLED':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Pending'
      case 'CONFIRMED':
        return 'Confirmed'
      case 'PROCESSING':
        return 'Processing'
      case 'SHIPPED':
        return 'Shipped'
      case 'DELIVERED':
        return 'Delivered'
      case 'CANCELLED':
        return 'Cancelled'
      default:
        return status
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg mb-4">You have no orders</p>
              <ShopButton
                href="/products"
                variant="primary"
                className="inline-block px-6 py-2"
              >
                Start Shopping
              </ShopButton>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <Card
                key={order.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">
                        Order #: {order.orderNumber}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <Badge variant={getStatusBadgeVariant(order.orderStatus)}>
                      {getStatusText(order.orderStatus)}
                    </Badge>
                  </div>
                </CardHeader>
                <Separator />
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    {/* Order Items Summary */}
                    <div className="space-y-2">
                      {order.items.slice(0, 2).map(item => (
                        <div key={item.id} className="flex items-center gap-3">
                          {item.product.images?.[0] && (
                            <img
                              src={item.product.images[0]}
                              alt={item.product.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {item.product.name}
                            </p>
                            {item.variant && (
                              <p className="text-xs text-muted-foreground">
                                {item.variant.name} × {item.quantity}
                              </p>
                            )}
                          </div>
                          <p className="text-sm font-medium">
                            ৳{item.price.toLocaleString('en-US')}
                          </p>
                        </div>
                      ))}
                      {order.items.length > 2 && (
                        <p className="text-sm text-muted-foreground">
                          {order.items.length - 2} more items...
                        </p>
                      )}
                    </div>

                    <Separator />

                    {/* Order Total */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Total Items: {order.items.length}
                        </p>
                        <p className="text-lg font-bold">
                          ৳{order.total.toLocaleString('en-US')}
                        </p>
                      </div>
                      <ShopButton
                        href={`/orders/${order.orderNumber}`}
                        variant="outline"
                        className="flex items-center gap-1 px-4 py-2 flex-none"
                      >
                        View Details
                        <ChevronRight className="w-4 h-4" />
                      </ShopButton>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
