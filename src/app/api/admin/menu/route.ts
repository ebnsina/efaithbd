import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const menuItems = await prisma.menuItem.findMany({
      where: { parentId: null },
      include: {
        children: {
          orderBy: { order: 'asc' },
          include: {
            children: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json(menuItems)
  } catch (error) {
    console.error('Error fetching menu items:', error)
    return NextResponse.json(
      { error: 'Failed to fetch menu items' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const menuItem = await prisma.menuItem.create({
      data: body,
    })

    return NextResponse.json(menuItem)
  } catch (error) {
    console.error('Error creating menu item:', error)
    return NextResponse.json(
      { error: 'Failed to create menu item' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { items } = body

    // Update order for all items
    await Promise.all(
      items.map((item: any) =>
        prisma.menuItem.update({
          where: { id: item.id },
          data: { order: item.order, parentId: item.parentId },
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating menu items:', error)
    return NextResponse.json(
      { error: 'Failed to update menu items' },
      { status: 500 }
    )
  }
}
