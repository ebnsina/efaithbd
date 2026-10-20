import { notFound } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { adminMiddleware } from '@/features/auth/auth.functions'
import { idSchema, withId } from '@/features/site-settings/fields'
import { prisma } from '@/server/db.server'
import { pageSchema } from './schemas'

export const listPages = createServerFn()
  .middleware([adminMiddleware])
  .handler(() =>
    prisma.page.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        published: true,
        updatedAt: true,
      },
      orderBy: { title: 'asc' },
    }),
  )

export const getPage = createServerFn()
  .middleware([adminMiddleware])
  .validator(idSchema)
  .handler(async ({ data }) => {
    const page = await prisma.page.findUnique({ where: { id: data.id } })
    if (!page) throw notFound()
    return page
  })

export const savePage = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .validator(withId(pageSchema))
  .handler(async ({ data: { id, values } }) => {
    const taken = await prisma.page.findFirst({
      where: { slug: values.slug, ...(id && { NOT: { id } }) },
      select: { id: true },
    })
    if (taken)
      return {
        ok: false as const,
        error: 'Another page already uses this link. Choose another.',
      }
    const page = id ? await prisma.page.update({ where: { id }, data: values }) : await prisma.page.create({ data: values })
    return { ok: true as const, page }
  })
