import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// PATCH /api/reviews/[id] - Update a review (admin only for approval, user for helpful count)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    const body = await request.json()

    const review = await prisma.review.findUnique({
      where: { id },
    })

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    // Admin can approve/reject reviews
    if (body.approved !== undefined) {
      if (session?.user?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }

      const updated = await prisma.review.update({
        where: { id },
        data: {
          approved: body.approved,
        },
      })

      // Recalculate product rating
      const reviews = await prisma.review.findMany({
        where: {
          productId: review.productId,
          approved: true,
        },
        select: {
          rating: true,
        },
      })

      const totalRating = reviews.reduce(
        (sum: number, r: any) => sum + r.rating,
        0
      )
      const reviewCount = reviews.length
      const averageRating = reviewCount > 0 ? totalRating / reviewCount : 0

      await prisma.product.update({
        where: { id: review.productId },
        data: {
          rating: averageRating,
          reviewCount,
        },
      })

      return NextResponse.json(updated)
    }

    // Anyone can increment helpful count
    if (body.helpful !== undefined) {
      const updated = await prisma.review.update({
        where: { id },
        data: {
          helpful: body.helpful,
        },
      })

      return NextResponse.json(updated)
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  } catch (error) {
    console.error('Error updating review:', error)
    return NextResponse.json(
      { error: 'Failed to update review' },
      { status: 500 }
    )
  }
}

// DELETE /api/reviews/[id] - Delete a review (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()

    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const review = await prisma.review.findUnique({
      where: { id },
    })

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    await prisma.review.delete({
      where: { id },
    })

    // Recalculate product rating
    const reviews = await prisma.review.findMany({
      where: {
        productId: review.productId,
        approved: true,
      },
      select: {
        rating: true,
      },
    })

    const totalRating = reviews.reduce(
      (sum: number, r: any) => sum + r.rating,
      0
    )
    const reviewCount = reviews.length
    const averageRating = reviewCount > 0 ? totalRating / reviewCount : 0

    await prisma.product.update({
      where: { id: review.productId },
      data: {
        rating: averageRating,
        reviewCount,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting review:', error)
    return NextResponse.json(
      { error: 'Failed to delete review' },
      { status: 500 }
    )
  }
}
