import { randomBytes } from 'node:crypto'
import type { Prisma } from '@/generated/client/client'
import type { prisma } from '@/server/db.server'
import { couponDiscount, couponProblem, mergeLines, shippingFits, variantLabel } from './pricing'
import type { CartLine } from './schemas'

type Db = Prisma.TransactionClient | typeof prisma

// The one place order money is worked out: the checkout summary and the placed order both use it
export async function priceCart(db: Db, input: { items: CartLine[]; couponCode: string; shippingMethodId: string }) {
  const items = mergeLines(input.items)
  const [products, methods, settings] = await Promise.all([
    db.product.findMany({
      where: { id: { in: items.map((item) => item.productId) } },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        stock: true,
        images: true,
        active: true,
        variants: { select: { id: true, name: true, value: true, price: true, stock: true } },
      },
    }),
    db.shippingMethod.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
      select: { id: true, name: true, description: true, cost: true, minOrder: true, maxOrder: true },
    }),
    db.basicSettings.findFirst({ select: { enableCoupons: true, currencySymbol: true, bkashNumber: true } }),
  ])

  const problems: string[] = []
  const lines = items.flatMap((item) => {
    const product = products.find((p) => p.id === item.productId)
    const variant = item.variantId ? product?.variants.find((v) => v.id === item.variantId) : undefined
    if (!product?.active || (item.variantId && !variant)) {
      problems.push(`${product?.name ?? 'An item in your cart'} is no longer available. Please remove it from your cart.`)
      return []
    }
    const stock = variant ? variant.stock : product.stock
    if (stock < item.quantity) {
      problems.push(
        stock > 0
          ? `Only ${stock} of ${product.name} left. Please lower the quantity in your cart.`
          : `${product.name} is out of stock. Please remove it from your cart.`,
      )
    }
    const unitPrice = product.price + (variant?.price ?? 0)
    return [
      {
        productId: product.id,
        variantId: variant?.id,
        name: product.name,
        slug: product.slug,
        image: product.images[0] ?? null,
        variantLabel: variant ? variantLabel(variant) : null,
        quantity: item.quantity,
        unitPrice,
        total: unitPrice * item.quantity,
      },
    ]
  })

  const subtotal = lines.reduce((sum, line) => sum + line.total, 0)
  const shippingOptions = methods
    .filter((method) => shippingFits(method, subtotal))
    .map(({ id, name, description, cost }) => ({ id, name, description, cost }))
  const shipping = shippingOptions.find((m) => m.id === input.shippingMethodId) ?? shippingOptions[0] ?? null

  let discount = 0
  let coupon: { code: string; description: string | null } | null = null
  let couponError: string | null = null
  if (input.couponCode) {
    const found = settings?.enableCoupons ? await db.coupon.findUnique({ where: { code: input.couponCode } }) : null
    couponError = couponProblem(found, subtotal, settings?.currencySymbol ?? '')
    if (found && !couponError) {
      discount = couponDiscount(found, subtotal)
      coupon = { code: found.code, description: found.description }
    }
  }

  return {
    lines,
    problems,
    subtotal,
    discount,
    coupon,
    couponError,
    couponsEnabled: settings?.enableCoupons ?? false,
    bkashAvailable: !!settings?.bkashNumber,
    shippingOptions,
    shipping,
    total: subtotal - discount + (shipping?.cost ?? 0),
  }
}

export class OrderProblem extends Error {}

type OrderDetails = Pick<
  Prisma.OrderUncheckedCreateInput,
  | 'userId'
  | 'customerName'
  | 'customerPhone'
  | 'customerAddress'
  | 'paymentMethod'
  | 'bkashNumber'
  | 'bkashTrxId'
  | 'paymentStatus'
  | 'orderStatus'
  | 'notes'
>

// Prices the cart, takes the stock and the coupon use, and records the order. Run it inside a transaction.
export async function createOrder(
  tx: Prisma.TransactionClient,
  cart: { items: CartLine[]; couponCode: string; shippingMethodId: string },
  details: OrderDetails,
) {
  const quote = await priceCart(tx, cart)
  if (quote.problems[0]) throw new OrderProblem(quote.problems[0])
  if (quote.couponError) throw new OrderProblem(quote.couponError)
  if (details.paymentMethod === 'BKASH' && !quote.bkashAvailable) {
    throw new OrderProblem('bKash payment is not available right now. Please choose cash on delivery.')
  }
  if (quote.shipping?.id !== cart.shippingMethodId) {
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

  return tx.order.create({
    data: {
      ...details,
      orderNumber: `ORD-${Date.now()}-${randomBytes(5).toString('hex').toUpperCase()}`,
      bkashNumber: details.paymentMethod === 'BKASH' ? details.bkashNumber : null,
      bkashTrxId: details.paymentMethod === 'BKASH' ? details.bkashTrxId : null,
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
    select: { id: true, orderNumber: true },
  })
}
