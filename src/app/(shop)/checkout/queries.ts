import { useMutation, useQuery } from '@tanstack/react-query'
import { fetchJson } from '@/lib/api'

interface ShippingOption {
  id: string
  name: string
  description: string | null
  cost: number
}

interface CouponResult {
  discount: number
  coupon: { code: string; description?: string }
}

export const usePaymentSettings = () =>
  useQuery({
    queryKey: ['payment-settings'],
    queryFn: () => fetchJson<{ bkashNumber: string | null; bkashNote: string | null }>('/api/payment-settings'),
  })

export const useShippingOptions = (subtotal: number) =>
  useQuery({
    queryKey: ['shipping-methods', { subtotal }],
    queryFn: () => fetchJson<ShippingOption[]>(`/api/shipping-methods?subtotal=${subtotal}`),
  })

export const useValidateCoupon = () =>
  useMutation({
    mutationFn: (body: { code: string; subtotal: number }) =>
      fetchJson<CouponResult>('/api/coupons/validate', { method: 'POST', body: JSON.stringify(body) }),
  })

export const usePlaceOrder = () =>
  useMutation({
    mutationFn: (body: object) =>
      fetchJson<{ orderNumber: string }>('/api/orders', { method: 'POST', body: JSON.stringify(body) }),
  })
