import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// PATCH /api/questions/[id] - Update a question (admin approval)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    const body = await request.json()

    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const question = await prisma.question.update({
      where: { id },
      data: {
        approved: body.approved,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        answers: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json(question)
  } catch (error) {
    console.error('Error updating question:', error)
    return NextResponse.json(
      { error: 'Failed to update question' },
      { status: 500 }
    )
  }
}

// DELETE /api/questions/[id] - Delete a question
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

    await prisma.question.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting question:', error)
    return NextResponse.json(
      { error: 'Failed to delete question' },
      { status: 500 }
    )
  }
}
