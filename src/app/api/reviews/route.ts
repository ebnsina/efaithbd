import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// GET /api/reviews?productId=xxx - Get reviews for a product
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const productId = searchParams.get('productId')
    const approved = searchParams.get('approved')

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    const where: any = { productId }

    // Public API only shows approved reviews unless admin
    if (approved !== 'false') {
      where.approved = true
    }

    const reviews = await prisma.review.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(reviews)
  } catch (error) {
    console.error('Error fetching reviews:', error)

    // Provide more specific error messages
    if (error instanceof Error) {
      // Database connection errors
      if (
        error.message.includes('prisma') ||
        error.message.includes('database')
      ) {
        return NextResponse.json(
          { error: 'Database connection error. Please try again later.' },
          { status: 500 }
        )
      }

      return NextResponse.json(
        { error: error.message || 'Failed to fetch reviews' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching reviews' },
      { status: 500 }
    )
  }
}

// POST /api/reviews - Create a new review
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    const body = await request.json()
    const { productId, rating, title, comment, verified } = body

    if (!productId || !rating || !comment) {
      return NextResponse.json(
        { error: 'Product ID, rating, and comment are required' },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    // User must be logged in to leave a review
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'You must be logged in to leave a review' },
        { status: 401 }
      )
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        productId,
        userId: session.user.id,
        rating,
        title,
        comment,
        verified: verified || false,
        approved: false, // Reviews need admin approval
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    // Update product rating and review count
    const reviews = await prisma.review.findMany({
      where: {
        productId,
        approved: true,
      },
      select: {
        rating: true,
      },
    })

    const totalRating = reviews.reduce(
      (sum, review) => sum + review.rating,
      rating
    )
    const reviewCount = reviews.length + 1
    const averageRating = totalRating / reviewCount

    await prisma.product.update({
      where: { id: productId },
      data: {
        rating: averageRating,
        reviewCount,
      },
    })

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error('Error creating review:', error)

    // Provide more specific error messages
    if (error instanceof Error) {
      // Duplicate review check
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: 'You have already reviewed this product' },
          { status: 409 }
        )
      }

      // Database connection errors
      if (
        error.message.includes('prisma') ||
        error.message.includes('database')
      ) {
        return NextResponse.json(
          { error: 'Database connection error. Please try again later.' },
          { status: 500 }
        )
      }

      return NextResponse.json(
        { error: error.message || 'Failed to create review' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred while creating review' },
      { status: 500 }
    )
  }
}
