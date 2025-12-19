import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const order = await prisma.order.update({
      where: { id },
      data: {
        orderStatus: body.orderStatus,
        paymentStatus: body.paymentStatus,
      },
    })
    return NextResponse.json(order)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    )
  }
}
