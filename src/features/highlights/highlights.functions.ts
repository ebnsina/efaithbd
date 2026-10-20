import { createServerFn } from '@tanstack/react-start'
import { adminMiddleware } from '@/features/auth/auth.functions'
import { withId } from '@/features/site-settings/fields'
import { prisma } from '@/server/db.server'
import { highlightSchema } from './schemas'

export const listHighlights = createServerFn()
  .middleware([adminMiddleware])
  .handler(() =>
    prisma.highlight.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    })
  )

export const saveHighlight = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .validator(withId(highlightSchema))
  .handler(async ({ data: { id, values } }) => {
    if (id) return prisma.highlight.update({ where: { id }, data: values })
    const last = await prisma.highlight.aggregate({ _max: { order: true } })
    return prisma.highlight.create({
      data: { ...values, order: (last._max.order ?? -1) + 1 },
    })
  })
