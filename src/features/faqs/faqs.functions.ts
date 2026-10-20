import { createServerFn } from '@tanstack/react-start'
import { adminMiddleware } from '@/features/auth/auth.functions'
import { withId } from '@/features/site-settings/fields'
import { prisma } from '@/server/db.server'
import { faqSchema } from './schemas'

export const listFaqs = createServerFn()
  .middleware([adminMiddleware])
  .handler(() => prisma.faq.findMany({ orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] }))

export const saveFaq = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .validator(withId(faqSchema))
  .handler(async ({ data: { id, values } }) => {
    if (id) return prisma.faq.update({ where: { id }, data: values })
    const last = await prisma.faq.aggregate({ _max: { order: true } })
    return prisma.faq.create({
      data: { ...values, order: (last._max.order ?? -1) + 1 },
    })
  })
