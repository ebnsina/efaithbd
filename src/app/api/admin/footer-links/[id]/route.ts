import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PUT update footer link
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const { sectionId, label, url, order, active } = body

    const link = await prisma.footerLink.update({
      where: { id },
      data: { sectionId, label, url, order, active },
    })

    return NextResponse.json(link)
  } catch (error) {
    console.error('Error updating footer link:', error)
    return NextResponse.json(
      { error: 'Failed to update footer link' },
      { status: 500 }
    )
  }
}

// DELETE footer link
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    await prisma.footerLink.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting footer link:', error)
    return NextResponse.json(
      { error: 'Failed to delete footer link' },
      { status: 500 }
    )
  }
}
