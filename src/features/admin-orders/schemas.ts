import * as v from 'valibot'
import { phoneSchema } from '@/features/checkout/schemas'
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

const detailsEntries = {
  customerName: v.pipe(v.string(), v.trim(), v.minLength(2, "Enter the customer's name"), v.maxLength(100)),
  customerPhone: phoneSchema,
  customerAddress: v.pipe(v.string(), v.trim(), v.minLength(10, 'Enter the full delivery address'), v.maxLength(500)),
  notes: v.pipe(v.string(), v.trim(), v.maxLength(1000, 'Keep the note under 1000 characters')),
}
export const orderDetailsSchema = v.object(detailsEntries)
export type OrderDetailsValues = v.InferInput<typeof orderDetailsSchema>
export const updateOrderDetailsSchema = v.object({ id: v.pipe(v.string(), v.nonEmpty()), ...detailsEntries })

const quantitySchema = v.pipe(
  v.nullable(v.number('Enter a quantity')),
  v.check((value) => value !== null, 'Enter a quantity'),
  v.transform((value) => value as number),
  v.integer('Use a whole number'),
  v.minValue(1, 'At least 1'),
  v.maxValue(999, 'At most 999'),
)

export const newOrderSchema = v.pipe(
  v.object({
    ...detailsEntries,
    userId: v.pipe(v.string(), v.maxLength(64)),
    items: v.pipe(
      v.array(
        v.object({
          productId: v.pipe(v.string(), v.minLength(1), v.maxLength(64)),
          variantId: v.pipe(v.string(), v.maxLength(64)),
          quantity: quantitySchema,
        }),
      ),
      v.minLength(1, 'Add at least one item'),
      v.maxLength(100, 'Add up to 100 items'),
    ),
    shippingMethodId: v.pipe(v.string(), v.minLength(1, 'Choose a delivery option')),
    couponCode: v.pipe(v.string(), v.trim(), v.toUpperCase(), v.maxLength(50)),
    paymentMethod: v.picklist(paymentMethods, 'Choose how the customer pays'),
    bkashNumber: v.pipe(v.string(), v.trim(), v.maxLength(11)),
    bkashTrxId: v.pipe(v.string(), v.trim(), v.toUpperCase(), v.maxLength(30)),
    paymentStatus: v.picklist(paymentStatuses),
    orderStatus: v.picklist(orderStatuses),
  }),
  v.forward(
    v.partialCheck(
      [['paymentMethod'], ['bkashNumber']],
      (input) => input.paymentMethod !== 'BKASH' || /^01[3-9]\d{8}$/.test(input.bkashNumber),
      'Enter the bKash number the customer paid from',
    ),
    ['bkashNumber'],
  ),
  v.forward(
    v.partialCheck(
      [['paymentMethod'], ['bkashTrxId']],
      (input) => input.paymentMethod !== 'BKASH' || /^[A-Z0-9]{6,30}$/.test(input.bkashTrxId),
      'Enter the transaction ID from the bKash message',
    ),
    ['bkashTrxId'],
  ),
)
export type NewOrderValues = v.InferInput<typeof newOrderSchema>

export const searchTextSchema = v.object({ q: v.pipe(v.string(), v.trim(), v.maxLength(100)) })

export const updateOrderSchema = v.object({
  id: v.pipe(v.string(), v.nonEmpty()),
  orderStatus: v.optional(v.picklist(orderStatuses)),
  paymentStatus: v.optional(v.picklist(paymentStatuses)),
})
export type UpdateOrderInput = v.InferOutput<typeof updateOrderSchema>
