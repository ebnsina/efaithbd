import { queryOptions } from '@tanstack/react-query'
import { getOrder, listMyOrders, trackOrders } from './orders.functions'

const orderKeys = {
  all: ['orders'] as const,
  detail: (orderNumber: string) => [...orderKeys.all, 'detail', orderNumber] as const,
  // Keyed by user so a cached list never survives a switch to another account
  mine: (userId: string) => [...orderKeys.all, 'mine', userId] as const,
  track: (phone: string) => [...orderKeys.all, 'track', phone] as const,
}

export const orderQuery = (orderNumber: string) =>
  queryOptions({ queryKey: orderKeys.detail(orderNumber), queryFn: () => getOrder({ data: { orderNumber } }) })

export const myOrdersQuery = (userId: string) =>
  queryOptions({ queryKey: orderKeys.mine(userId), queryFn: () => listMyOrders() })

export const trackOrdersQuery = (phone: string) =>
  queryOptions({ queryKey: orderKeys.track(phone), queryFn: () => trackOrders({ data: { phone } }) })
