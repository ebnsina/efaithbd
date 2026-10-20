import { createServerFn } from '@tanstack/react-start'
import * as v from 'valibot'
import { adminMiddleware } from '@/features/auth/auth.functions'
import type { Prisma } from '@/generated/client/client'
import { toPrismaPage } from '@/lib/list-search'
import { prisma } from '@/server/db.server'
import { reviewSearchSchema } from './schemas'

export const listAdminReviews = createServerFn()
  .middleware([adminMiddleware])
  .validator(reviewSearchSchema)
  .handler(async ({ data: search }) => {
    const { q, status, rating } = search
    const where: Prisma.ReviewWhereInput = {
      ...(q && {
        OR: [
          { comment: { contains: q, mode: 'insensitive' } },
          { title: { contains: q, mode: 'insensitive' } },
          { product: { name: { contains: q, mode: 'insensitive' } } },
          { user: { name: { contains: q, mode: 'insensitive' } } },
        ],
      }),
      ...(status && { approved: status === 'approved' }),
      ...(rating && { rating: Number.parseInt(rating, 10) }),
    }
    const [rows, rowCount, pendingCount] = await Promise.all([
      prisma.review.findMany({
        where,
        select: {
          id: true,
          rating: true,
          title: true,
          comment: true,
          approved: true,
          verified: true,
          createdAt: true,
          product: { select: { name: true, slug: true } },
          user: { select: { name: true, email: true } },
        },
        ...toPrismaPage(search, ['createdAt', 'rating'], 'createdAt'),
      }),
      prisma.review.count({ where }),
      prisma.review.count({ where: { approved: false } }),
    ])
    return { rows, rowCount, pendingCount }
  })

// The product's stored rating and count only include approved reviews
async function refreshProductRating(tx: Prisma.TransactionClient, productId: string) {
  const stats = await tx.review.aggregate({
    where: { productId, approved: true },
    _avg: { rating: true },
    _count: true,
  })
  await tx.product.update({
    where: { id: productId },
    data: { rating: stats._avg.rating ?? 0, reviewCount: stats._count },
  })
}

export const setReviewApproval = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .validator(v.object({ id: v.string(), approved: v.boolean() }))
  .handler(({ data }) =>
    prisma.$transaction(async (tx) => {
      const review = await tx.review.update({
        where: { id: data.id },
        data: { approved: data.approved },
        select: { productId: true },
      })
      await refreshProductRating(tx, review.productId)
      return { ok: true }
    }),
  )

export const deleteReview = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .validator(v.object({ id: v.string() }))
  .handler(({ data }) =>
    prisma.$transaction(async (tx) => {
      const review = await tx.review.delete({ where: { id: data.id }, select: { productId: true } })
      await refreshProductRating(tx, review.productId)
      return { ok: true }
    }),
  )
