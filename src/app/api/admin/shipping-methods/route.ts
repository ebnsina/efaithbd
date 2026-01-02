import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  try {
    const shippingMethods = await prisma.shippingMethod.findMany({
      orderBy: { order: 'asc' },
    })
    return NextResponse.json(shippingMethods)
  } catch (error) {
    console.error('Error fetching shipping methods:', error)
    return NextResponse.json(
      { error: 'Failed to fetch shipping methods' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, cost, minOrder, maxOrder, active, order } = body

    if (!name || cost === undefined) {
      return NextResponse.json(
        { error: 'Name and cost are required' },
        { status: 400 }
      )
    }

    const shippingMethod = await prisma.shippingMethod.create({
      data: {
        name,
        description,
        cost: parseFloat(cost),
        minOrder: minOrder ? parseFloat(minOrder) : null,
        maxOrder: maxOrder ? parseFloat(maxOrder) : null,
        active: active !== undefined ? active : true,
        order: order || 0,
      },
    })

    return NextResponse.json(shippingMethod, { status: 201 })
  } catch (error) {
    console.error('Error creating shipping method:', error)
    return NextResponse.json(
      { error: 'Failed to create shipping method' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { items } = body

    if (items && Array.isArray(items)) {
      // Bulk update for reordering
      await Promise.all(
        items.map((item: any) =>
          prisma.shippingMethod.update({
            where: { id: item.id },
            data: { order: item.order },
          })
        )
      )
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  } catch (error) {
    console.error('Error updating shipping methods:', error)
    return NextResponse.json(
      { error: 'Failed to update shipping methods' },
      { status: 500 }
    )
  }
}
