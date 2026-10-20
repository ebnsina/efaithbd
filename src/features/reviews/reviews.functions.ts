import { createServerFn } from '@tanstack/react-start'
import { prisma } from '@/server/db.server'
import { getSessionUser } from '@/server/session.server'
import { createReviewSchema, REVIEWS_PAGE_SIZE, reviewIdSchema, reviewListSchema } from './schemas'

export const listReviews = createServerFn()
  .validator(reviewListSchema)
  .handler(async ({ data: { productId, page } }) => {
    const where = { productId, approved: true }
    const [rows, groups] = await Promise.all([
      prisma.review.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
        skip: (page - 1) * REVIEWS_PAGE_SIZE,
        take: REVIEWS_PAGE_SIZE,
        // Only the reviewer's name is public; never their email
        select: {
          id: true,
          rating: true,
          title: true,
          comment: true,
          verified: true,
          helpful: true,
          createdAt: true,
          user: { select: { name: true } },
        },
      }),
      prisma.review.groupBy({ by: ['rating'], where, _count: { _all: true } }),
    ])
    const counts = [1, 2, 3, 4, 5].map((stars) => groups.find((g) => g.rating === stars)?._count._all ?? 0)
    const total = counts.reduce((sum, n) => sum + n, 0)
    const average = total ? counts.reduce((sum, n, i) => sum + n * (i + 1), 0) / total : 0
    return { rows, total, average, counts, hasMore: page * REVIEWS_PAGE_SIZE < total }
  })

export const createReview = createServerFn({ method: 'POST' })
  .validator(createReviewSchema)
  .handler(async ({ data }) => {
    const user = await getSessionUser()
    if (!user) return { ok: false as const, error: 'Please sign in to write a review' }
    const [settings, product, existing, purchased] = await Promise.all([
      prisma.basicSettings.findFirst({ select: { enableReviews: true } }),
      prisma.product.findUnique({ where: { id: data.productId, active: true }, select: { id: true } }),
      prisma.review.findFirst({ where: { productId: data.productId, userId: user.id }, select: { id: true } }),
      prisma.orderItem.findFirst({
        where: { productId: data.productId, order: { userId: user.id, orderStatus: 'DELIVERED' } },
        select: { id: true },
      }),
    ])
    if (settings && !settings.enableReviews) return { ok: false as const, error: 'Reviews are turned off for now' }
    if (!product) return { ok: false as const, error: 'This product is no longer available' }
    if (existing) return { ok: false as const, error: 'You have already reviewed this product' }
    // Hidden until an admin approves it; the product's rating is recalculated on approval, not here
    await prisma.review.create({
      data: {
        productId: data.productId,
        userId: user.id,
        rating: data.rating,
        title: data.title || null,
        comment: data.comment,
        verified: !!purchased,
        approved: false,
      },
    })
    return { ok: true as const }
  })

export const markReviewHelpful = createServerFn({ method: 'POST' })
  .validator(reviewIdSchema)
  .handler(async ({ data }) => {
    const { count } = await prisma.review.updateMany({
      where: { id: data.id, approved: true },
      data: { helpful: { increment: 1 } },
    })
    return { ok: count > 0 }
  })
