import { notFound } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { adminMiddleware } from '@/features/auth/auth.functions'
import { idSchema, withId } from '@/features/site-settings/fields'
import { prisma } from '@/server/db.server'
import { bannerSchema } from './schemas'

export const listBanners = createServerFn()
  .middleware([adminMiddleware])
  .handler(() =>
    prisma.banner.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    }),
  )

export const getBanner = createServerFn()
  .middleware([adminMiddleware])
  .validator(idSchema)
  .handler(async ({ data }) => {
    const banner = await prisma.banner.findUnique({ where: { id: data.id } })
    if (!banner) throw notFound()
    return banner
  })

export const saveBanner = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .validator(withId(bannerSchema))
  .handler(async ({ data: { id, values } }) => {
    if (id) return prisma.banner.update({ where: { id }, data: values })
    const last = await prisma.banner.aggregate({ _max: { order: true } })
    return prisma.banner.create({
      data: { ...values, order: (last._max.order ?? -1) + 1 },
    })
  })
