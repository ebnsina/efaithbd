import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PUT update social link
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const { platform, url, icon, order, active } = body

    const link = await prisma.socialLink.update({
      where: { id },
      data: { platform, url, icon, order, active },
    })

    return NextResponse.json(link)
  } catch (error) {
    console.error('Error updating social link:', error)
    return NextResponse.json(
      { error: 'Failed to update social link' },
      { status: 500 }
    )
  }
}

// DELETE social link
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    await prisma.socialLink.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting social link:', error)
    return NextResponse.json(
      { error: 'Failed to delete social link' },
      { status: 500 }
    )
  }
}
