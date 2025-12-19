import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'
import { ShopButton } from '@/components/ShopButton'

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>
}) {
  const { orderNumber } = await params
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: {
        include: {
          product: true,
          variant: true,
        },
      },
    },
  })

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Order Not Found</h1>
        <Link href="/" className="text-primary hover:underline">
          Back to Homepage
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Success Message */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center mb-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-green-800 mb-2">
            Order Successful!
          </h1>
          <p className="text-green-700 mb-4">
            Your order has been successfully completed. We will contact you
            soon.
          </p>
          <p className="text-sm text-green-600">
            You can track your order anytime using your phone number{' '}
            <strong>{order.customerPhone}</strong>.
          </p>
        </div>

        {/* Guest Account Creation Prompt */}
        {!order.userId && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-blue-900 mb-2">
              Create an account for more benefits!
            </h3>
            <ul className="text-sm text-blue-700 mb-4 space-y-1">
              <li>✓ View all orders in one place</li>
              <li>✓ Fast checkout</li>
              <li>✓ Use saved addresses</li>
              <li>✓ Get special offers</li>
            </ul>

            <ShopButton href="/register" variant="primary">
              Create Free Account
            </ShopButton>
          </div>
        )}

        {/* Order Details */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Order Details</h2>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600">Order Number</span>
              <span className="font-semibold">{order.orderNumber}</span>
            </div>

            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600">Date</span>
              <span className="font-semibold">
                {new Date(order.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>

            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600">Status</span>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded text-sm font-semibold">
                {order.orderStatus}
              </span>
            </div>

            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600">Payment Method</span>
              <span className="font-semibold">
                {order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'bKash'}
              </span>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-gray-50 rounded p-4 mb-6">
            <h3 className="font-bold mb-3">Delivery Information</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Name: </span>
                <span className="font-semibold">{order.customerName}</span>
              </div>
              <div>
                <span className="text-gray-600">Phone: </span>
                <span className="font-semibold">{order.customerPhone}</span>
              </div>
              <div>
                <span className="text-gray-600">Address: </span>
                <span className="font-semibold">{order.customerAddress}</span>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-6">
            <h3 className="font-bold mb-3">Order Items</h3>
            <div className="space-y-3">
              {order.items.map(item => (
                <div
                  key={item.id}
                  className="flex justify-between items-center border-b pb-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.product.images[0] || '/placeholder.jpg'}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div>
                      <p className="font-semibold">{item.product.name}</p>
                      {item.variant && (
                        <p className="text-sm text-gray-600">
                          {item.variant.value}
                        </p>
                      )}
                      <p className="text-sm text-gray-600">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">
                      ৳{order.total.toLocaleString('en-US')}
                    </p>
                    <p className="text-sm text-gray-600">
                      ৳{item.price.toLocaleString('en-US')} x {item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Total */}
          <div className="border-t pt-4">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Subtotal</span>
              <span>৳{order.subtotal.toLocaleString('en-US')}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between mb-2 text-green-600">
                <span>Discount</span>
                <span>-৳{order.discount.toLocaleString('en-US')}</span>
              </div>
            )}
            <div className="flex justify-between text-xl font-bold pt-2 border-t">
              <span>Total</span>
              <span className="text-primary">
                ৳{order.total.toLocaleString('en-US')}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <ShopButton href="/" variant="primary">
            Back to Homepage
          </ShopButton>
          <ShopButton href="/products" variant="outline">
            Continue Shopping
          </ShopButton>
        </div>

        {/* Help Text */}
        <div className="mt-8 p-4 bg-blue-50 rounded text-center text-sm text-blue-800">
          <p>
            If you have any issues, please contact us. Your order number:{' '}
            <span className="font-bold">{order.orderNumber}</span>
          </p>
        </div>
      </div>
    </div>
  )
}
