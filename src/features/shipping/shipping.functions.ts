import { createServerFn } from '@tanstack/react-start'
import * as v from 'valibot'
import { adminMiddleware } from '@/features/auth/auth.functions'
import { prisma } from '@/server/db.server'
import { reorderShippingMethodsSchema, saveShippingMethodSchema } from './schemas'

export const listShippingMethods = createServerFn()
  .middleware([adminMiddleware])
  .handler(() =>
    prisma.shippingMethod.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      select: {
        id: true,
        name: true,
        description: true,
        cost: true,
        minOrder: true,
        maxOrder: true,
        active: true,
      },
    }),
  )

export const saveShippingMethod = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .validator(saveShippingMethodSchema)
  .handler(async ({ data: { id, method } }) => {
    const data = { ...method, description: method.description || null }
    if (id) {
      await prisma.shippingMethod.update({
        where: { id },
        data,
        select: { id: true },
      })
    } else {
      // New methods go to the end of the list
      const last = await prisma.shippingMethod.aggregate({
        _max: { order: true },
      })
      await prisma.shippingMethod.create({
        data: { ...data, order: (last._max.order ?? -1) + 1 },
        select: { id: true },
      })
    }
    return { ok: true }
  })

export const reorderShippingMethods = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .validator(reorderShippingMethodsSchema)
  .handler(async ({ data }) => {
    await prisma.$transaction(
      data.ids.map((id, order) =>
        prisma.shippingMethod.update({
          where: { id },
          data: { order },
          select: { id: true },
        }),
      ),
    )
    return { ok: true }
  })

export const deleteShippingMethod = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .validator(v.object({ id: v.pipe(v.string(), v.nonEmpty()) }))
  .handler(async ({ data }) => {
    await prisma.shippingMethod.delete({
      where: { id: data.id },
      select: { id: true },
    })
    return { ok: true }
  })
