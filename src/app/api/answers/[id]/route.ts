import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// PATCH /api/answers/[id] - Update an answer (admin approval)
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

    const answer = await prisma.answer.update({
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
      },
    })

    return NextResponse.json(answer)
  } catch (error) {
    console.error('Error updating answer:', error)
    return NextResponse.json(
      { error: 'Failed to update answer' },
      { status: 500 }
    )
  }
}

// DELETE /api/answers/[id] - Delete an answer
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

    await prisma.answer.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting answer:', error)
    return NextResponse.json(
      { error: 'Failed to delete answer' },
      { status: 500 }
    )
  }
}
