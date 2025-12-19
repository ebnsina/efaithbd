import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET single feature card
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const card = await prisma.featureCard.findUnique({
      where: { id },
    })

    if (!card) {
      return NextResponse.json(
        { error: 'Feature card not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(card)
  } catch (error) {
    console.error('Error fetching feature card:', error)
    return NextResponse.json(
      { error: 'Failed to fetch feature card' },
      { status: 500 }
    )
  }
}

// PUT update feature card
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const { title, description, icon, order, active } = body

    const card = await prisma.featureCard.update({
      where: { id },
      data: {
        title,
        description,
        icon,
        order,
        active,
      },
    })

    return NextResponse.json(card)
  } catch (error) {
    console.error('Error updating feature card:', error)
    return NextResponse.json(
      { error: 'Failed to update feature card' },
      { status: 500 }
    )
  }
}

// DELETE feature card
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    await prisma.featureCard.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting feature card:', error)
    return NextResponse.json(
      { error: 'Failed to delete feature card' },
      { status: 500 }
    )
  }
}
