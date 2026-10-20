import * as v from 'valibot'

const limit = v.nullable(v.pipe(v.number(), v.minValue(0, 'Enter 0 or more, or leave it empty')))

// Shared by the form and the server function
export const shippingMethodSchema = v.pipe(
  v.object({
    name: v.pipe(v.string(), v.trim(), v.nonEmpty('Enter a name'), v.maxLength(80, 'Keep the name under 80 characters')),
    description: v.pipe(v.string(), v.trim(), v.maxLength(200, 'Keep the description under 200 characters')),
    cost: v.pipe(
      v.nullable(v.number()),
      v.check((cost) => cost !== null && cost >= 0, 'Enter the delivery charge (0 for free)'),
      v.transform((cost) => cost as number),
    ),
    minOrder: limit,
    maxOrder: limit,
    active: v.boolean(),
  }),
  v.forward(
    v.partialCheck(
      [['minOrder'], ['maxOrder']],
      ({ minOrder, maxOrder }) => minOrder === null || maxOrder === null || maxOrder >= minOrder,
      'The maximum must be at least the minimum',
    ),
    ['maxOrder'],
  ),
)
export type ShippingMethodInput = v.InferInput<typeof shippingMethodSchema>

export const saveShippingMethodSchema = v.object({
  id: v.optional(v.string()),
  method: shippingMethodSchema,
})
export const reorderShippingMethodsSchema = v.object({
  ids: v.pipe(v.array(v.pipe(v.string(), v.nonEmpty())), v.minLength(1), v.maxLength(200)),
})
