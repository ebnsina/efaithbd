import { createServerFn } from '@tanstack/react-start'
import * as v from 'valibot'
import { prisma } from '@/server/db.server'

export const getPublishedPage = createServerFn()
  .validator(v.object({ slug: v.pipe(v.string(), v.maxLength(100)) }))
  .handler(({ data }) =>
    prisma.page.findFirst({
      where: { slug: data.slug, published: true },
      select: { title: true, content: true, metaDescription: true, updatedAt: true },
    }),
  )
