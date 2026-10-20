import { createServerFn } from '@tanstack/react-start'
import * as v from 'valibot'
import type { Prisma } from '@/generated/client/client'
import { adminMiddleware } from '@/features/auth/auth.functions'
import { toPrismaPage } from '@/lib/list-search'
import { prisma } from '@/server/db.server'
import { adminProductSearchSchema } from './schemas'

export const listAdminProducts = createServerFn()
  .middleware([adminMiddleware])
  .validator(adminProductSearchSchema)
  .handler(async ({ data: search }) => {
    const { q, status } = search
    const where: Prisma.ProductWhereInput = {
      ...(q && {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { slug: { contains: q, mode: 'insensitive' } },
          { category: { name: { contains: q, mode: 'insensitive' } } },
        ],
      }),
      ...(status === 'active' && { active: true }),
      ...(status === 'inactive' && { active: false }),
      ...(status === 'featured' && { featured: true }),
    }
    const [rows, rowCount] = await Promise.all([
      prisma.product.findMany({
        where,
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          stock: true,
          images: true,
          featured: true,
          active: true,
          category: { select: { name: true } },
          _count: { select: { variants: true } },
        },
        ...toPrismaPage(search, ['name', 'price', 'stock', 'createdAt'], 'createdAt'),
      }),
      prisma.product.count({ where }),
    ])
    return { rows, rowCount }
  })

export const deleteProduct = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .validator(v.object({ id: v.string() }))
  .handler(async ({ data }) => {
    await prisma.product.delete({ where: { id: data.id } })
    return { ok: true }
  })
