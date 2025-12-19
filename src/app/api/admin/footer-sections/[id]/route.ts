import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PUT update footer section
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const { title, order, active } = body

    const section = await prisma.footerSection.update({
      where: { id },
      data: { title, order, active },
    })

    return NextResponse.json(section)
  } catch (error) {
    console.error('Error updating footer section:', error)
    return NextResponse.json(
      { error: 'Failed to update footer section' },
      { status: 500 }
    )
  }
}

// DELETE footer section
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    await prisma.footerSection.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting footer section:', error)
    return NextResponse.json(
      { error: 'Failed to delete footer section' },
      { status: 500 }
    )
  }
}
