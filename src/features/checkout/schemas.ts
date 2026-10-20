import * as v from 'valibot'

export const phoneSchema = v.pipe(
  v.string(),
  v.trim(),
  v.regex(/^01[3-9]\d{8}$/, 'Enter an 11-digit mobile number, like 01712345678'),
)

// Only ids and quantities come from the browser; every price is read from the database
export const cartLinesSchema = v.pipe(
  v.array(
    v.object({
      productId: v.pipe(v.string(), v.minLength(1), v.maxLength(64)),
      variantId: v.optional(v.pipe(v.string(), v.maxLength(64))),
      quantity: v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(999)),
    }),
  ),
  v.minLength(1, 'Your cart is empty'),
  v.maxLength(100),
)
export type CartLine = v.InferOutput<typeof cartLinesSchema>[number]

const couponCodeSchema = v.pipe(v.string(), v.trim(), v.toUpperCase(), v.maxLength(50))

export const checkoutFormSchema = v.pipe(
  v.object({
    customerName: v.pipe(v.string(), v.trim(), v.minLength(2, 'Enter your name'), v.maxLength(100)),
    customerPhone: phoneSchema,
    customerAddress: v.pipe(v.string(), v.trim(), v.minLength(10, 'Enter your full delivery address'), v.maxLength(500)),
    shippingMethodId: v.pipe(v.string(), v.minLength(1, 'Choose a delivery option')),
    paymentMethod: v.picklist(['COD', 'BKASH'], 'Choose how you want to pay'),
    bkashNumber: v.pipe(v.string(), v.trim(), v.maxLength(11)),
    bkashTrxId: v.pipe(v.string(), v.trim(), v.toUpperCase(), v.maxLength(30)),
    couponCode: couponCodeSchema,
  }),
  v.forward(
    v.partialCheck(
      [['paymentMethod'], ['bkashNumber']],
      (input) => input.paymentMethod !== 'BKASH' || /^01[3-9]\d{8}$/.test(input.bkashNumber),
      'Enter the bKash number you paid from',
    ),
    ['bkashNumber'],
  ),
  v.forward(
    v.partialCheck(
      [['paymentMethod'], ['bkashTrxId']],
      (input) => input.paymentMethod !== 'BKASH' || /^[A-Z0-9]{6,30}$/.test(input.bkashTrxId),
      'Enter the transaction ID from your bKash message',
    ),
    ['bkashTrxId'],
  ),
)
export type CheckoutForm = v.InferInput<typeof checkoutFormSchema>

export const placeOrderSchema = v.object({ form: checkoutFormSchema, items: cartLinesSchema })

export const quoteSchema = v.object({
  items: cartLinesSchema,
  couponCode: v.optional(couponCodeSchema, ''),
  shippingMethodId: v.optional(v.string(), ''),
})
export type QuoteInput = v.InferInput<typeof quoteSchema>
