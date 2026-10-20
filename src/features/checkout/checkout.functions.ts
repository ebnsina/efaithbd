import { createServerFn } from '@tanstack/react-start'
import { prisma } from '@/server/db.server'
import { getSessionUser } from '@/server/session.server'
import { createOrder, OrderProblem, priceCart } from './checkout.server'
import { placeOrderSchema, quoteSchema } from './schemas'

export const getCheckoutQuote = createServerFn({ method: 'POST' })
  .validator(quoteSchema)
  .handler(({ data }) => priceCart(prisma, data))

export const placeOrder = createServerFn({ method: 'POST' })
  .validator(placeOrderSchema)
  .handler(async ({ data: { form, items } }) => {
    const user = await getSessionUser()
    try {
      const order = await prisma.$transaction((tx) =>
        createOrder(
          tx,
          { items, couponCode: form.couponCode, shippingMethodId: form.shippingMethodId },
          {
            userId: user?.id ?? null,
            customerName: form.customerName,
            customerPhone: form.customerPhone,
            customerAddress: form.customerAddress,
            paymentMethod: form.paymentMethod,
            bkashNumber: form.bkashNumber,
            bkashTrxId: form.bkashTrxId,
          },
        ),
      )
      return { ok: true as const, orderNumber: order.orderNumber }
    } catch (error) {
      if (error instanceof OrderProblem) return { ok: false as const, error: error.message }
      console.error('placeOrder failed', error)
      return { ok: false as const, error: "We couldn't place your order. Please try again in a moment." }
    }
  })
