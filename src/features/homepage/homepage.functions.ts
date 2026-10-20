import { notFound } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { adminMiddleware } from '@/features/auth/auth.functions'
import { idSchema, withId } from '@/features/site-settings/fields'
import { prisma } from '@/server/db.server'
import { featureCardSchema, midBannerSchema, sectionSchema } from './schemas'

const byOrder = [{ order: 'asc' as const }, { createdAt: 'asc' as const }]

export const getHomepage = createServerFn()
  .middleware([adminMiddleware])
  .handler(async () => {
    const [sections, featureCards, midBanners] = await Promise.all([
      prisma.productSection.findMany({ orderBy: byOrder }),
      prisma.featureCard.findMany({ orderBy: byOrder }),
      prisma.midBanner.findMany({
        orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
      }),
    ])
    return { sections, featureCards, midBanners }
  })

const orNotFound = <T>(row: T | null) => {
  if (!row) throw notFound()
  return row
}

export const getSection = createServerFn()
  .middleware([adminMiddleware])
  .validator(idSchema)
  .handler(async ({ data }) => orNotFound(await prisma.productSection.findUnique({ where: { id: data.id } })))

export const getFeatureCard = createServerFn()
  .middleware([adminMiddleware])
  .validator(idSchema)
  .handler(async ({ data }) => orNotFound(await prisma.featureCard.findUnique({ where: { id: data.id } })))

export const getMidBanner = createServerFn()
  .middleware([adminMiddleware])
  .validator(idSchema)
  .handler(async ({ data }) => orNotFound(await prisma.midBanner.findUnique({ where: { id: data.id } })))

export const saveSection = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .validator(withId(sectionSchema))
  .handler(async ({ data: { id, values } }) => {
    if (id) return prisma.productSection.update({ where: { id }, data: values })
    const last = await prisma.productSection.aggregate({
      _max: { order: true },
    })
    return prisma.productSection.create({
      data: { ...values, order: (last._max.order ?? -1) + 1 },
    })
  })

export const saveFeatureCard = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .validator(withId(featureCardSchema))
  .handler(async ({ data: { id, values } }) => {
    if (id) return prisma.featureCard.update({ where: { id }, data: values })
    const last = await prisma.featureCard.aggregate({ _max: { order: true } })
    return prisma.featureCard.create({
      data: { ...values, order: (last._max.order ?? -1) + 1 },
    })
  })

export const saveMidBanner = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .validator(withId(midBannerSchema))
  .handler(({ data: { id, values } }) =>
    id ? prisma.midBanner.update({ where: { id }, data: values }) : prisma.midBanner.create({ data: values }),
  )
