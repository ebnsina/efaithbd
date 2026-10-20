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
          : `${product.name} is out of stock. Please remove it from your cart.`
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

