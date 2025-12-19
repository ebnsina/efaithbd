import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        subcategory: true,
        variants: true,
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(products)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Create product with variants if provided
    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description,
        price: parseFloat(body.price),
        comparePrice: body.comparePrice ? parseFloat(body.comparePrice) : null,
        stock: parseInt(body.stock),
        images: body.images || [],
        categoryId: body.categoryId,
        subcategoryId: body.subcategoryId || null,
        featured: body.featured || false,
        active: body.active ?? true,
        variants:
          body.variants?.length > 0
            ? {
                create: body.variants.map((v: any) => ({
                  name: v.name,
                  value: v.value,
                  price: v.price ? parseFloat(v.price) : null,
                  stock: parseInt(v.stock),
                  sku: v.sku || null,
                })),
              }
            : undefined,
      },
      include: {
        category: true,
        subcategory: true,
        variants: true,
      },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Product creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}
