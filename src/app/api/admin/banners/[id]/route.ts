import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PUT update banner
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const { title, subtitle, image, link, order, active } = body

    const banner = await prisma.banner.update({
      where: { id },
      data: {
        title,
        subtitle,
        image,
        link,
        order,
        active,
      },
    })

    return NextResponse.json(banner)
  } catch (error) {
    console.error('Error updating banner:', error)
    return NextResponse.json(
      { error: 'Failed to update banner' },
      { status: 500 }
    )
  }
}

// DELETE banner
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    await prisma.banner.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting banner:', error)
    return NextResponse.json(
      { error: 'Failed to delete banner' },
      { status: 500 }
    )
  }
}
