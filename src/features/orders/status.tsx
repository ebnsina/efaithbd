import { Badge } from '@/components/ui/badge'

type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'

const statuses: Record<OrderStatus, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  PENDING: { label: 'Received', variant: 'outline' },
  CONFIRMED: { label: 'Confirmed', variant: 'secondary' },
  PROCESSING: { label: 'Being packed', variant: 'secondary' },
  SHIPPED: { label: 'On the way', variant: 'secondary' },
  DELIVERED: { label: 'Delivered', variant: 'default' },
  CANCELLED: { label: 'Cancelled', variant: 'destructive' },
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const { label, variant } = statuses[status]
  return <Badge variant={variant}>{label}</Badge>
}

export const paymentLabel = (method: 'COD' | 'BKASH') => (method === 'COD' ? 'Cash on delivery' : 'bKash')

export const paymentStatusLabel = (status: 'PENDING' | 'PAID' | 'FAILED') =>
  ({ PENDING: 'Not paid yet', PAID: 'Paid', FAILED: 'Payment failed' })[status]
