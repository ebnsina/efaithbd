import * as v from 'valibot'
import { listSearchEntries } from '@/lib/list-search'
import { orderStatuses, paymentMethods, paymentStatuses } from './status'

const optionalPick = <T extends readonly [string, ...string[]]>(options: T) =>
  v.optional(v.fallback(v.optional(v.picklist(options)), undefined))

export const adminOrderListSchema = v.object({
  ...listSearchEntries,
  orderStatus: optionalPick(orderStatuses),
  paymentStatus: optionalPick(paymentStatuses),
  paymentMethod: optionalPick(paymentMethods),
})
export type AdminOrderSearch = v.InferOutput<typeof adminOrderListSchema>

// The route adds the open order's id on top of the list search
export const adminOrderRouteSchema = v.object({
  ...adminOrderListSchema.entries,
  order: v.optional(v.fallback(v.optional(v.pipe(v.string(), v.maxLength(50))), undefined)),
})

export const updateOrderSchema = v.object({
  id: v.pipe(v.string(), v.nonEmpty()),
  orderStatus: v.optional(v.picklist(orderStatuses)),
  paymentStatus: v.optional(v.picklist(paymentStatuses)),
})
export type UpdateOrderInput = v.InferOutput<typeof updateOrderSchema>
