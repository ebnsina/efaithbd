'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, Search, Eye, Package } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerPhone: string
  customerAddress: string
  subtotal: number
  discount: number
  total: number
  paymentMethod: string
  paymentStatus: string
  orderStatus: string
  bkashNumber?: string | null
  bkashTrxId?: string | null
  notes?: string | null
  createdAt: string
  coupon?: {
    code: string
    description: string | null
    type: string
    value: number
  } | null
  items?: Array<{
    id: string
    product?: {
      name: string
    }
    variant?: {
      name: string
      value: string
    } | null
    quantity: number
    price: number
    total: number
  }>
}

// API functions
const fetchOrders = async (): Promise<Order[]> => {
  const res = await fetch('/api/orders')
  if (!res.ok) throw new Error('Failed to fetch orders')
  return res.json()
}

const updateOrderStatus = async ({
  orderId,
  orderStatus,
  paymentStatus,
}: {
  orderId: string
  orderStatus?: string
  paymentStatus?: string
}): Promise<Order> => {
  const res = await fetch(`/api/admin/orders/${orderId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderStatus,
      paymentStatus,
    }),
  })
  if (!res.ok) throw new Error('Failed to update order')
  return res.json()
}

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const queryClient = useQueryClient()

  // Fetch orders query
  const {
    data: orders = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrders,
  })

  // Update order mutation
  const updateMutation = useMutation({
    mutationFn: updateOrderStatus,
    onSuccess: updatedOrder => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      // Update the selected order in the dialog
      if (selectedOrder && selectedOrder.id === updatedOrder.id) {
        setSelectedOrder(updatedOrder)
      }
      toast.success('Update Success')
    },
    onError: () => {
      toast.error('Update Error')
    },
  })

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order)
    setDialogOpen(true)
  }

  const handleStatusUpdate = (
    orderId: string,
    field: 'orderStatus' | 'paymentStatus',
    value: string
  ) => {
    updateMutation.mutate({
      orderId,
      [field]: value,
    })
  }

  const filteredOrders = orders.filter(
    order =>
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerPhone.includes(searchQuery)
  )

  const getOrderStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      PENDING: {
        label: 'Pending',
        className:
          'bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-600/20',
      },
      CONFIRMED: {
        label: 'Confirmed',
        className:
          'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20',
      },
      PROCESSING: {
        label: 'Processing',
        className:
          'bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-600/20',
      },
      SHIPPED: {
        label: 'Shipped',
        className:
          'bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-600/20',
      },
      DELIVERED: {
        label: 'Delivered',
        className:
          'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20',
      },
      CANCELLED: {
        label: 'Cancelled',
        className: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20',
      },
    }

    const statusInfo = statusMap[status] || {
      label: status,
      className: 'bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-600/20',
    }

    return (
      <span
        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${statusInfo.className}`}
      >
        {statusInfo.label}
      </span>
    )
  }

  const getPaymentStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      PENDING: {
        label: 'Pending',
        className:
          'bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-600/20',
      },
      PAID: {
        label: 'Paid',
        className:
          'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20',
      },
      FAILED: {
        label: 'Failed',
        className: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20',
      },
    }

    const statusInfo = statusMap[status] || {
      label: status,
      className: 'bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-600/20',
    }

    return (
      <span
        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${statusInfo.className}`}
      >
        {statusInfo.label}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {'Order Management'}
          </h1>
          <p className="text-muted-foreground mt-2">View and manage orders</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder={'Search Orders'}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : isError ? (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                Failed to load orders
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <Package className="h-16 w-16 mb-4 text-muted-foreground/50" />
                <p className="text-lg font-medium">No orders found</p>
                <p className="text-sm mt-1">
                  {searchQuery
                    ? 'No search results'
                    : 'No orders have been placed yet'}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order Number</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Order Status</TableHead>
                    <TableHead>Payment Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map(order => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        {order.orderNumber}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {order.customerName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {order.customerPhone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        ৳{order.total.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {order.paymentMethod}
                        </span>
                      </TableCell>
                      <TableCell>
                        {getOrderStatusBadge(order.orderStatus)}
                      </TableCell>
                      <TableCell>
                        {getPaymentStatusBadge(order.paymentStatus)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(order)}
                        >
                          <Eye className="h-4 w-4" />
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl! max-h-[90vh] p-0">
          {selectedOrder && (
            <>
              <DialogHeader className="p-6 pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <DialogTitle className="text-xl">Order Details</DialogTitle>
                    <DialogDescription className="mt-1">
                      {selectedOrder.orderNumber}
                    </DialogDescription>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        Order:
                      </span>
                      {getOrderStatusBadge(selectedOrder.orderStatus)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        Payment:
                      </span>
                      {getPaymentStatusBadge(selectedOrder.paymentStatus)}
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <Separator />

              <ScrollArea className="max-h-[calc(90vh-140px)]">
                <div className="p-6 space-y-6">
                  {/* Customer Information */}
                  <div>
                    <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
                      Customer Information
                    </h3>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground block mb-1">
                              Name
                            </span>
                            <span className="font-medium">
                              {selectedOrder.customerName}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block mb-1">
                              Phone Number
                            </span>
                            <span className="font-medium">
                              {selectedOrder.customerPhone}
                            </span>
                          </div>
                          <div className="md:col-span-2">
                            <span className="text-muted-foreground block mb-1">
                              Address
                            </span>
                            <span className="font-medium">
                              {selectedOrder.customerAddress}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h3 className="font-semibold text-base mb-3">
                      Product List
                    </h3>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          {selectedOrder.items &&
                          selectedOrder.items.length > 0 ? (
                            selectedOrder.items.map((item, idx) => (
                              <div
                                key={item.id}
                                className="flex justify-between items-start pb-4 border-b last:border-0 last:pb-0"
                              >
                                <div className="flex-1">
                                  <div className="font-medium">
                                    {item.product?.name ||
                                      item.product?.name ||
                                      'N/A'}
                                  </div>
                                  {item.variant && (
                                    <div className="text-sm text-muted-foreground mt-1">
                                      {item.variant.name}: {item.variant.value}
                                    </div>
                                  )}
                                  <div className="text-sm text-muted-foreground mt-1">
                                    ৳{item.price.toLocaleString()} ×{' '}
                                    {item.quantity}
                                  </div>
                                </div>
                                <div className="font-semibold text-right">
                                  ৳{item.total.toLocaleString()}
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">
                              No product information
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Order Summary */}
                  <div>
                    <h3 className="font-semibold text-base mb-3">
                      Order Summary
                    </h3>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Subtotal
                            </span>
                            <span className="font-medium">
                              ৳{selectedOrder.subtotal.toLocaleString()}
                            </span>
                          </div>
                          {selectedOrder.discount > 0 && (
                            <>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">
                                  Discount
                                  {selectedOrder.coupon && (
                                    <Badge variant="outline" className="ml-2">
                                      {selectedOrder.coupon.code}
                                    </Badge>
                                  )}
                                </span>
                                <span className="font-medium text-green-600">
                                  -৳{selectedOrder.discount.toLocaleString()}
                                </span>
                              </div>
                              {selectedOrder.coupon && (
                                <div className="text-xs text-muted-foreground pl-4">
                                  {selectedOrder.coupon.description ||
                                    `${
                                      selectedOrder.coupon.type === 'PERCENTAGE'
                                        ? `${selectedOrder.coupon.value}%`
                                        : `৳${selectedOrder.coupon.value}`
                                    } off`}
                                </div>
                              )}
                            </>
                          )}
                          <Separator />
                          <div className="flex justify-between font-semibold text-lg">
                            <span>Total</span>
                            <span className="text-primary">
                              ৳{selectedOrder.total.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Payment Information */}
                  <div>
                    <h3 className="font-semibold text-base mb-3">
                      Payment Information
                    </h3>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Payment Method
                            </span>
                            <span className="font-medium">
                              {selectedOrder.paymentMethod === 'COD'
                                ? 'Cash on Delivery'
                                : 'bKash'}
                            </span>
                          </div>
                          {selectedOrder.paymentMethod === 'BKASH' && (
                            <>
                              {selectedOrder.bkashNumber && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    bKash Number
                                  </span>
                                  <span className="font-medium">
                                    {selectedOrder.bkashNumber}
                                  </span>
                                </div>
                              )}
                              {selectedOrder.bkashTrxId && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Transaction ID
                                  </span>
                                  <span className="font-medium font-mono">
                                    {selectedOrder.bkashTrxId}
                                  </span>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Order Notes */}
                  {selectedOrder.notes && (
                    <div>
                      <h3 className="font-semibold text-base mb-3">Notes</h3>
                      <Card>
                        <CardContent className="pt-6">
                          <p className="text-sm text-muted-foreground">
                            {selectedOrder.notes}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Order Date */}
                  <div>
                    <h3 className="font-semibold text-base mb-3">Order Date</h3>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-sm">
                          <div className="text-muted-foreground">
                            {new Date(selectedOrder.createdAt).toLocaleString(
                              'bn-BD',
                              {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              }
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Status Management */}
                  <div>
                    <h3 className="font-semibold text-base mb-3">
                      Status Update
                    </h3>
                    <Card>
                      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Order Status
                          </label>
                          <Select
                            value={selectedOrder.orderStatus}
                            onValueChange={value =>
                              handleStatusUpdate(
                                selectedOrder.id,
                                'orderStatus',
                                value
                              )
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PENDING">Pending</SelectItem>
                              <SelectItem value="CONFIRMED">
                                Confirmed
                              </SelectItem>
                              <SelectItem value="PROCESSING">
                                Processing
                              </SelectItem>
                              <SelectItem value="SHIPPED">Shipped</SelectItem>
                              <SelectItem value="DELIVERED">
                                Delivered
                              </SelectItem>
                              <SelectItem value="CANCELLED">
                                Cancelled
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Payment Status
                          </label>
                          <Select
                            value={selectedOrder.paymentStatus}
                            onValueChange={value =>
                              handleStatusUpdate(
                                selectedOrder.id,
                                'paymentStatus',
                                value
                              )
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PENDING">Pending</SelectItem>
                              <SelectItem value="PAID">Paid</SelectItem>
                              <SelectItem value="FAILED">Failed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </ScrollArea>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
