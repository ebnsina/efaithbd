import * as v from 'valibot'
import { listSearchEntries } from '@/lib/list-search'

export const couponListSchema = v.object({
  ...listSearchEntries,
  status: v.optional(v.fallback(v.optional(v.picklist(['active', 'inactive', 'expired'])), undefined)),
})
export type CouponSearch = v.InferOutput<typeof couponListSchema>

const amount = (message: string) => v.nullable(v.pipe(v.number(message), v.minValue(0, message)))
const date = (message: string) => v.pipe(v.string(), v.isoDate(message))

// Shared by the form and the server function
export const couponSchema = v.pipe(
  v.object({
    code: v.pipe(
      v.string(),
      v.trim(),
      v.nonEmpty('Enter a coupon code'),
      v.maxLength(30, 'Keep the code under 30 characters'),
      v.regex(/^[A-Za-z0-9_-]+$/, 'Use only letters, numbers, dashes or underscores'),
    ),
    description: v.pipe(v.string(), v.trim(), v.maxLength(300, 'Keep the description under 300 characters')),
    type: v.picklist(['PERCENTAGE', 'FIXED'], 'Choose a discount type'),
    value: v.pipe(
      v.nullable(v.number()),
      v.check((value) => value !== null && value > 0, 'Enter a discount greater than 0'),
      v.transform((value) => value as number),
    ),
    minPurchase: amount('Enter 0 or more, or leave it empty'),
    maxDiscount: amount('Enter 0 or more, or leave it empty'),
    usageLimit: v.nullable(v.pipe(v.number(), v.integer('Use a whole number'), v.minValue(1, 'Allow at least 1 use'))),
    validFrom: date('Pick a start date'),
    validTo: date('Pick an end date'),
    active: v.boolean(),
  }),
  v.forward(
    v.partialCheck(
      [['type'], ['value']],
      ({ type, value }) => type !== 'PERCENTAGE' || value <= 100,
      'A percentage discount can be at most 100',
    ),
    ['value'],
  ),
  v.forward(
    v.partialCheck(
      [['validFrom'], ['validTo']],
      ({ validFrom, validTo }) => validTo >= validFrom,
      'The end date must be on or after the start date',
    ),
    ['validTo'],
  ),
)
export type CouponInput = v.InferInput<typeof couponSchema>

export const saveCouponSchema = v.object({
  id: v.optional(v.string()),
  coupon: couponSchema,
})
