import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET single product section
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const section = await prisma.productSection.findUnique({
      where: { id },
    })

    if (!section) {
      return NextResponse.json(
        { error: 'Product section not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(section)
  } catch (error) {
    console.error('Error fetching product section:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product section' },
      { status: 500 }
    )
  }
}

// PUT update product section
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const { title, type, order, limit, active } = body

    const section = await prisma.productSection.update({
      where: { id },
      data: {
        title,
        type,
        order,
        limit,
        active,
      },
    })

    return NextResponse.json(section)
  } catch (error) {
    console.error('Error updating product section:', error)
    return NextResponse.json(
      { error: 'Failed to update product section' },
      { status: 500 }
    )
  }
}

// DELETE product section
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    await prisma.productSection.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting product section:', error)
    return NextResponse.json(
      { error: 'Failed to delete product section' },
      { status: 500 }
    )
  }
}
