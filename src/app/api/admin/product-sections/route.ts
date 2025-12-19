import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET all product sections
export async function GET() {
  try {
    const sections = await prisma.productSection.findMany({
      orderBy: { order: 'asc' },
    })
    return NextResponse.json(sections)
  } catch (error) {
    console.error('Error fetching product sections:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product sections' },
      { status: 500 }
    )
  }
}

// POST create new product section
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, type, order, limit, active } = body

    const section = await prisma.productSection.create({
      data: {
        title,
        type,
        order: order || 0,
        limit: limit || 10,
        active: active !== undefined ? active : true,
      },
    })

    return NextResponse.json(section)
  } catch (error) {
    console.error('Error creating product section:', error)
    return NextResponse.json(
      { error: 'Failed to create product section' },
      { status: 500 }
    )
  }
}
