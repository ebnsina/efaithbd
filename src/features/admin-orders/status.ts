import type { VariantProps } from 'class-variance-authority'
import type { badgeVariants } from '@/components/ui/badge'

type BadgeVariant = VariantProps<typeof badgeVariants>['variant']

export const orderStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const
export const paymentStatuses = ['PENDING', 'PAID', 'FAILED'] as const
export const paymentMethods = ['COD', 'BKASH'] as const

export type OrderStatus = (typeof orderStatuses)[number]
export type PaymentStatus = (typeof paymentStatuses)[number]
export type PaymentMethod = (typeof paymentMethods)[number]

export const orderStatusLabels: Record<OrderStatus, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
}

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  PENDING: 'Not paid yet',
  PAID: 'Paid',
  FAILED: 'Failed',
}

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  COD: 'Cash on delivery',
  BKASH: 'bKash',
}

export const orderStatusBadge: Record<OrderStatus, BadgeVariant> = {
  PENDING: 'outline',
  CONFIRMED: 'secondary',
  PROCESSING: 'secondary',
  SHIPPED: 'secondary',
  DELIVERED: 'default',
  CANCELLED: 'destructive',
}

export const paymentStatusBadge: Record<PaymentStatus, BadgeVariant> = {
  PENDING: 'outline',
  PAID: 'default',
  FAILED: 'destructive',
}

export const toOptions = <K extends string>(labels: Record<K, string>) =>
  (Object.keys(labels) as K[]).map((value) => ({
    value,
    label: labels[value],
  }))
