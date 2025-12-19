import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET single mid banner
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const banner = await prisma.midBanner.findUnique({
      where: { id },
    })

    if (!banner) {
      return NextResponse.json(
        { error: 'Mid banner not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(banner)
  } catch (error) {
    console.error('Error fetching mid banner:', error)
    return NextResponse.json(
      { error: 'Failed to fetch mid banner' },
      { status: 500 }
    )
  }
}

// PUT update mid banner
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const { title, subtitle, image, link, position, active } = body

    const banner = await prisma.midBanner.update({
      where: { id },
      data: {
        title,
        subtitle,
        image,
        link,
        position,
        active,
      },
    })

    return NextResponse.json(banner)
  } catch (error) {
    console.error('Error updating mid banner:', error)
    return NextResponse.json(
      { error: 'Failed to update mid banner' },
      { status: 500 }
    )
  }
}

// DELETE mid banner
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    await prisma.midBanner.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting mid banner:', error)
    return NextResponse.json(
      { error: 'Failed to delete mid banner' },
      { status: 500 }
    )
  }
}
