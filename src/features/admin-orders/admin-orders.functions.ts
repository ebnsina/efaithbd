import { createServerFn } from '@tanstack/react-start'
import * as v from 'valibot'
import { adminMiddleware } from '@/features/auth/auth.functions'
import { createOrder, OrderProblem } from '@/features/checkout/checkout.server'
import type { Prisma } from '@/generated/client/client'
import { toPrismaPage } from '@/lib/list-search'
import { prisma } from '@/server/db.server'
import {
  adminOrderListSchema,
  newOrderSchema,
  searchTextSchema,
  updateOrderDetailsSchema,
  updateOrderSchema,
} from './schemas'

export const listAdminOrders = createServerFn()
  .middleware([adminMiddleware])
  .validator(adminOrderListSchema)
  .handler(async ({ data: search }) => {
    const { q, orderStatus, paymentStatus, paymentMethod } = search
    const where: Prisma.OrderWhereInput = {
      ...(q && {
        OR: [
          { orderNumber: { contains: q, mode: 'insensitive' } },
          { customerName: { contains: q, mode: 'insensitive' } },
          { customerPhone: { contains: q } },
        ],
      }),
      ...(orderStatus && { orderStatus }),
      ...(paymentStatus && { paymentStatus }),
      ...(paymentMethod && { paymentMethod }),
    }
    const [rows, rowCount] = await Promise.all([
      prisma.order.findMany({
        where,
        select: {
          id: true,
          orderNumber: true,
          customerName: true,
          customerPhone: true,
          total: true,
          paymentMethod: true,
          paymentStatus: true,
          orderStatus: true,
          createdAt: true,
        },
        ...toPrismaPage(search, ['orderNumber', 'customerName', 'total', 'createdAt'], 'createdAt'),
      }),
      prisma.order.count({ where }),
    ])
    return { rows, rowCount }
  })

export const getAdminOrder = createServerFn()
  .middleware([adminMiddleware])
  .validator(v.object({ id: v.pipe(v.string(), v.nonEmpty()) }))
  .handler(({ data }) =>
    prisma.order.findUnique({
      where: { id: data.id },
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        customerPhone: true,
        customerAddress: true,
        subtotal: true,
        discount: true,
        shippingCost: true,
        total: true,
        paymentMethod: true,
        paymentStatus: true,
        orderStatus: true,
        bkashNumber: true,
        bkashTrxId: true,
        notes: true,
        createdAt: true,
        coupon: { select: { code: true } },
        user: { select: { email: true } },
        shippingMethod: { select: { name: true } },
        items: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            quantity: true,
            price: true,
            total: true,
            product: { select: { name: true, images: true } },
            variant: { select: { name: true, value: true } },
          },
        },
      },
    }),
  )

type StockLine = { productId: string; variantId: string | null; quantity: number }

// Mirrors createOrder: variant items hold their own stock, simple items use the product's
async function returnStock(tx: Prisma.TransactionClient, items: StockLine[]) {
  for (const item of items) {
    const data = { stock: { increment: item.quantity } }
    if (item.variantId) await tx.productVariant.update({ where: { id: item.variantId }, data })
    else await tx.product.update({ where: { id: item.productId }, data })
  }
}

async function takeStock(tx: Prisma.TransactionClient, items: (StockLine & { product: { name: string } })[]) {
  for (const item of items) {
    const where = { stock: { gte: item.quantity } }
    const data = { stock: { decrement: item.quantity } }
    const { count } = item.variantId
      ? await tx.productVariant.updateMany({ where: { id: item.variantId, ...where }, data })
      : await tx.product.updateMany({ where: { id: item.productId, ...where }, data })
    if (count === 0) {
      throw new OrderProblem(`There isn't enough stock of ${item.product.name} to reopen this order.`)
    }
  }
}

const stockItems = { select: { productId: true, variantId: true, quantity: true, product: { select: { name: true } } } }
const changedElsewhere = 'This order was just changed somewhere else. Please reload and try again.'

const problemResult = (error: unknown) => {
  if (error instanceof OrderProblem) return { ok: false as const, error: error.message }
  throw error
}

// Cancelling returns the items to stock; reopening a cancelled order takes them again
export const updateOrder = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .validator(updateOrderSchema)
  .handler(async ({ data: { id, ...changes } }) => {
    try {
      await prisma.$transaction(async (tx) => {
        const order = await tx.order.findUnique({ where: { id }, select: { orderStatus: true, items: stockItems } })
        if (!order) throw new OrderProblem('This order no longer exists.')
        const { count } = await tx.order.updateMany({ where: { id, orderStatus: order.orderStatus }, data: changes })
        if (count === 0) throw new OrderProblem(changedElsewhere)
        const wasCancelled = order.orderStatus === 'CANCELLED'
        const isCancelled = (changes.orderStatus ?? order.orderStatus) === 'CANCELLED'
        if (!wasCancelled && isCancelled) await returnStock(tx, order.items)
        if (wasCancelled && !isCancelled) await takeStock(tx, order.items)
      })
      return { ok: true as const }
    } catch (error) {
      return problemResult(error)
    }
  })

export const updateOrderDetails = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .validator(updateOrderDetailsSchema)
  .handler(async ({ data: { id, notes, ...details } }) => {
    const { count } = await prisma.order.updateMany({ where: { id }, data: { ...details, notes: notes || null } })
    return count ? { ok: true as const } : { ok: false as const, error: 'This order no longer exists.' }
  })

// A cancelled order already gave its stock back, so only open orders return it here
export const deleteOrder = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .validator(v.object({ id: v.pipe(v.string(), v.nonEmpty()) }))
  .handler(async ({ data: { id } }) => {
    try {
      await prisma.$transaction(async (tx) => {
        const order = await tx.order.findUnique({
          where: { id },
          select: { orderStatus: true, couponId: true, items: stockItems },
        })
        if (!order) return
        const { count } = await tx.order.deleteMany({ where: { id, orderStatus: order.orderStatus } })
        if (count === 0) throw new OrderProblem(changedElsewhere)
        if (order.orderStatus !== 'CANCELLED') await returnStock(tx, order.items)
        if (order.couponId) {
          await tx.coupon.updateMany({
            where: { id: order.couponId, usageCount: { gt: 0 } },
            data: { usageCount: { decrement: 1 } },
          })
        }
      })
      return { ok: true as const }
    } catch (error) {
      return problemResult(error)
    }
  })

export type CreateOrderResult = { ok: true; id: string } | { ok: false; error: string; fieldErrors?: Record<string, string> }

export const createAdminOrder = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .validator(newOrderSchema)
  .handler(async ({ data }): Promise<CreateOrderResult> => {
    const { items, userId, couponCode, shippingMethodId, notes, ...details } = data
    const [withOptions, user] = await Promise.all([
      prisma.product.findMany({
        where: { id: { in: items.filter((item) => !item.variantId).map((item) => item.productId) }, variants: { some: {} } },
        select: { id: true },
      }),
      userId ? prisma.user.findUnique({ where: { id: userId }, select: { id: true } }) : null,
    ])
    const fieldErrors: Record<string, string> = {}
    items.forEach((item, index) => {
      if (!item.variantId && withOptions.some((product) => product.id === item.productId)) {
        fieldErrors[`items[${index}].variantId`] = 'Choose an option'
      }
    })
    if (userId && !user) fieldErrors.userId = 'This customer account no longer exists. Remove it and try again.'
    if (Object.keys(fieldErrors).length) return { ok: false, error: 'Please fix the highlighted fields', fieldErrors }

    try {
      const order = await prisma.$transaction((tx) =>
        createOrder(
          tx,
          {
            items: items.map((item) => ({ ...item, variantId: item.variantId || undefined })),
            couponCode,
            shippingMethodId,
          },
          { ...details, userId: userId || null, notes: notes || null },
        ),
      )
      return { ok: true, id: order.id }
    } catch (error) {
      return problemResult(error)
    }
  })

export const searchOrderCustomers = createServerFn()
  .middleware([adminMiddleware])
  .validator(searchTextSchema)
  .handler(({ data: { q } }) =>
    prisma.user.findMany({
      where: {
        role: 'CUSTOMER',
        ...(q && {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
            { phone: { contains: q } },
          ],
        }),
      },
      orderBy: { name: 'asc' },
      take: 8,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        orders: { orderBy: { createdAt: 'desc' }, take: 1, select: { customerAddress: true } },
      },
    }),
  )

export const searchOrderProducts = createServerFn()
  .middleware([adminMiddleware])
  .validator(searchTextSchema)
  .handler(({ data: { q } }) =>
    prisma.product.findMany({
      where: { active: true, ...(q && { name: { contains: q, mode: 'insensitive' } }) },
      orderBy: { name: 'asc' },
      take: 10,
      select: {
        id: true,
        name: true,
        price: true,
        stock: true,
        images: true,
        variants: {
          orderBy: { createdAt: 'asc' },
          select: { id: true, name: true, value: true, price: true, stock: true },
        },
      },
    }),
  )
export type OrderProductOption = Awaited<ReturnType<typeof searchOrderProducts>>[number]
export type OrderCustomerOption = Awaited<ReturnType<typeof searchOrderCustomers>>[number]
