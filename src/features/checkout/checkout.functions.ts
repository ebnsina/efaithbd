import { randomBytes } from 'node:crypto'
import { createServerFn } from '@tanstack/react-start'
import { prisma } from '@/server/db.server'
import { getSessionUser } from '@/server/session.server'
import { priceCart } from './checkout.server'
import { placeOrderSchema, quoteSchema } from './schemas'

export const getCheckoutQuote = createServerFn({ method: 'POST' })
  .validator(quoteSchema)
  .handler(({ data }) => priceCart(prisma, data))

class OrderProblem extends Error {}

export const placeOrder = createServerFn({ method: 'POST' })
  .validator(placeOrderSchema)
  .handler(async ({ data: { form, items } }) => {
    const user = await getSessionUser()
    try {
      const orderNumber = await prisma.$transaction(async (tx) => {
        const quote = await priceCart(tx, { items, couponCode: form.couponCode, shippingMethodId: form.shippingMethodId })
        if (quote.problems[0]) throw new OrderProblem(quote.problems[0])
        if (quote.couponError) throw new OrderProblem(quote.couponError)
        if (form.paymentMethod === 'BKASH' && !quote.bkashAvailable) {
          throw new OrderProblem('bKash payment is not available right now. Please choose cash on delivery.')
        }
        if (quote.shipping?.id !== form.shippingMethodId) {
          throw new OrderProblem('That delivery option is no longer available. Please choose another one.')
        }

        // Conditional decrements, so two orders racing for the last item can't both succeed
        for (const line of quote.lines) {
          const where = { stock: { gte: line.quantity } }
          const data = { stock: { decrement: line.quantity } }
          const { count } = line.variantId
            ? await tx.productVariant.updateMany({ where: { id: line.variantId, ...where }, data })
            : await tx.product.updateMany({ where: { id: line.productId, ...where }, data })
          if (count === 0) throw new OrderProblem(`${line.name} just sold out. Please update your cart.`)
        }

        let couponId: string | null = null
        if (quote.coupon) {
          const coupon = await tx.coupon.update({
            where: { code: quote.coupon.code },
            data: { usageCount: { increment: 1 } },
          })
          if (coupon.usageLimit !== null && coupon.usageCount > coupon.usageLimit) {
            throw new OrderProblem('This coupon has been fully used')
          }
          couponId = coupon.id
        }

        const order = await tx.order.create({
          data: {
            orderNumber: `ORD-${Date.now()}-${randomBytes(5).toString('hex').toUpperCase()}`,
            userId: user?.id ?? null,
            customerName: form.customerName,
            customerPhone: form.customerPhone,
            customerAddress: form.customerAddress,
            paymentMethod: form.paymentMethod,
            bkashNumber: form.paymentMethod === 'BKASH' ? form.bkashNumber : null,
            bkashTrxId: form.paymentMethod === 'BKASH' ? form.bkashTrxId : null,
            subtotal: quote.subtotal,
            discount: quote.discount,
            shippingCost: quote.shipping.cost,
            total: quote.total,
            couponId,
            shippingMethodId: quote.shipping.id,
            items: {
              create: quote.lines.map((line) => ({
                productId: line.productId,
                variantId: line.variantId ?? null,
                quantity: line.quantity,
                price: line.unitPrice,
                total: line.total,
              })),
            },
          },
          select: { orderNumber: true },
        })
        return order.orderNumber
      })
      return { ok: true as const, orderNumber }
    } catch (error) {
      if (error instanceof OrderProblem) return { ok: false as const, error: error.message }
      console.error('placeOrder failed', error)
      return { ok: false as const, error: "We couldn't place your order. Please try again in a moment." }
    }
  })
