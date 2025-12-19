import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        subcategories: true,
        _count: {
          select: { products: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(categories)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const category = await prisma.category.create({
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description || null,
        image: body.image || null,
      },
    })
    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    )
  }
}
