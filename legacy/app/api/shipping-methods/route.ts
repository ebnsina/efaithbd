import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const subtotal = searchParams.get('subtotal')

    const shippingMethods = await prisma.shippingMethod.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
    })

    // Filter by subtotal if provided
    if (subtotal) {
      const subtotalAmount = parseFloat(subtotal)
      const filteredMethods = shippingMethods.filter(method => {
        const meetsMin = !method.minOrder || subtotalAmount >= method.minOrder
        const meetsMax = !method.maxOrder || subtotalAmount <= method.maxOrder
        return meetsMin && meetsMax
      })
      return NextResponse.json(filteredMethods)
    }

    return NextResponse.json(shippingMethods)
  } catch (error) {
    console.error('Error fetching shipping methods:', error)
    return NextResponse.json(
      { error: 'Failed to fetch shipping methods' },
      { status: 500 }
    )
  }
}
