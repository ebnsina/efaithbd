import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// POST /api/questions/[id]/answers - Create an answer
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: questionId } = await params
    const session = await auth()
    const body = await request.json()
    const { answer } = body

    if (!answer) {
      return NextResponse.json({ error: 'Answer is required' }, { status: 400 })
    }

    // User must be logged in to answer questions
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'You must be logged in to answer a question' },
        { status: 401 }
      )
    }

    const isOfficial = session.user.role === 'ADMIN'

    const newAnswer = await prisma.answer.create({
      data: {
        questionId,
        userId: session.user.id,
        answer,
        isOfficial,
        approved: isOfficial, // Admin answers are auto-approved
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

    return NextResponse.json(newAnswer, { status: 201 })
  } catch (error) {
    console.error('Error creating answer:', error)

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

      // Question not found
      if (error.message.includes('Foreign key constraint')) {
        return NextResponse.json(
          { error: 'Question not found' },
          { status: 404 }
        )
      }

      return NextResponse.json(
        { error: error.message || 'Failed to create answer' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred while creating answer' },
      { status: 500 }
    )
  }
}
