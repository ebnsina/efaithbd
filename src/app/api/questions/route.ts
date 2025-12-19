import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// GET /api/questions?productId=xxx - Get questions for a product
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

    // Public API only shows approved questions unless admin
    if (approved !== 'false') {
      where.approved = true
    }

    const questions = await prisma.question.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        answers: {
          where: approved !== 'false' ? { approved: true } : undefined,
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(questions)
  } catch (error) {
    console.error('Error fetching questions:', error)

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
        { error: error.message || 'Failed to fetch questions' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching questions' },
      { status: 500 }
    )
  }
}

// POST /api/questions - Create a new question
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    const body = await request.json()
    const { productId, question } = body

    if (!productId || !question) {
      return NextResponse.json(
        { error: 'Product ID and question are required' },
        { status: 400 }
      )
    }

    // User must be logged in to ask questions
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'You must be logged in to ask a question' },
        { status: 401 }
      )
    }

    const newQuestion = await prisma.question.create({
      data: {
        productId,
        userId: session.user.id,
        question,
        approved: false, // Questions need admin approval
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        answers: true,
      },
    })

    return NextResponse.json(newQuestion, { status: 201 })
  } catch (error) {
    console.error('Error creating question:', error)

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

      // Product not found
      if (error.message.includes('Foreign key constraint')) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        )
      }

      return NextResponse.json(
        { error: error.message || 'Failed to create question' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred while creating question' },
      { status: 500 }
    )
  }
}
