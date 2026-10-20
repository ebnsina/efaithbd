import { createServerFn } from '@tanstack/react-start'
import * as v from 'valibot'
import { prisma } from '@/server/db.server'
import { getSessionUser } from '@/server/session.server'
import { orderNumberSchema, trackSchema } from './schemas'

const itemSelect = {
  id: true,
  quantity: true,
  price: true,
  total: true,
  product: { select: { name: true, slug: true, images: true } },
  variant: { select: { name: true, value: true } },
} as const

export const getOrder = createServerFn()
  .validator(v.object({ orderNumber: orderNumberSchema }))
  .handler(async ({ data }) => {
    const [order, user] = await Promise.all([
      prisma.order.findUnique({
        where: { orderNumber: data.orderNumber },
        select: {
          orderNumber: true,
          userId: true,
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
          createdAt: true,
          shippingMethod: { select: { name: true } },
          items: { select: itemSelect },
        },
      }),
      getSessionUser(),
    ])
    if (!order) return null
    const { userId, customerPhone, customerAddress, ...rest } = order
    // Anyone who tracks a phone number learns its order numbers, so contact details stay with the account owner
    const isOwner = !!user && user.id === userId
    return {
      ...rest,
      isGuestOrder: !userId,
      isOwner,
      customerPhone: isOwner ? customerPhone : `•••••••${customerPhone.slice(-4)}`,
      customerAddress: isOwner ? customerAddress : null,
    }
  })

export const listMyOrders = createServerFn().handler(async () => {
  const user = await getSessionUser()
  if (!user) return null
  return prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    select: {
      orderNumber: true,
      total: true,
      orderStatus: true,
      createdAt: true,
      items: { select: itemSelect },
    },
  })
})

export const trackOrders = createServerFn()
  .validator(trackSchema)
  .handler(({ data }) =>
    prisma.order.findMany({
      where: { customerPhone: data.phone },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        orderNumber: true,
        total: true,
        orderStatus: true,
        paymentMethod: true,
        paymentStatus: true,
        createdAt: true,
        _count: { select: { items: true } },
      },
    }),
  )
