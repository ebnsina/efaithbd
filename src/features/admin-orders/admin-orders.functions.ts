import { createServerFn } from '@tanstack/react-start'
import * as v from 'valibot'
import { adminMiddleware } from '@/features/auth/auth.functions'
import type { Prisma } from '@/generated/client/client'
import { toPrismaPage } from '@/lib/list-search'
import { prisma } from '@/server/db.server'
import { adminOrderListSchema, updateOrderSchema } from './schemas'

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

export const updateOrder = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .validator(updateOrderSchema)
  .handler(async ({ data: { id, ...changes } }) => {
    await prisma.order.update({
      where: { id },
      data: changes,
      select: { id: true },
    })
    return { ok: true }
  })
