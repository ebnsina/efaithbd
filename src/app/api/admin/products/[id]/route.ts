import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        subcategory: true,
        variants: true,
      },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Product fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // First, delete existing variants if any
    if (body.variants) {
      await prisma.productVariant.deleteMany({
        where: { productId: id },
      })
    }

    // Update product with new variants
    const product = await prisma.product.update({
      where: { id },
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description,
        price: parseFloat(body.price),
        comparePrice: body.comparePrice ? parseFloat(body.comparePrice) : null,
        stock: parseInt(body.stock) || 0,
        images: body.images || [],
        categoryId: body.categoryId,
        subcategoryId: body.subcategoryId || null,
        featured: body.featured || false,
        active: body.active ?? true,
        variants:
          body.variants?.length > 0
            ? {
                create: body.variants.map((v: any, index: number) => ({
                  name: v.name,
                  value: v.value,
                  price: v.price ? parseFloat(v.price) : null,
                  stock: parseInt(v.stock) || 0,
                  sku: v.sku && v.sku.trim() !== '' ? v.sku : null,
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

    return NextResponse.json(product)
  } catch (error) {
    console.error('Product update error:', error)
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.product.delete({
      where: { id },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}
