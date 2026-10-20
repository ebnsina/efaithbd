import { NextRequest, NextResponse } from 'next/server'
import type { Prisma } from '@/generated/client/client'
import { parseListParams, pickParam } from '@/lib/list-params'
import { prisma } from '@/lib/prisma'
import { refreshStorefront } from '@/lib/revalidate'

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const { q, sort, dir, skip, take } = parseListParams(params, ['name', 'price', 'stock', 'createdAt'], 'createdAt')
  const status = pickParam(params, 'status', ['active', 'inactive', 'featured'] as const)
  const where: Prisma.ProductWhereInput = {
    ...(q && {
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { slug: { contains: q, mode: 'insensitive' } },
        { category: { name: { contains: q, mode: 'insensitive' } } },
      ],
    }),
    ...(status === 'active' && { active: true }),
    ...(status === 'inactive' && { active: false }),
    ...(status === 'featured' && { featured: true }),
  }
  try {
    const [rows, rowCount] = await Promise.all([
      prisma.product.findMany({
        where,
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          stock: true,
          images: true,
          featured: true,
          active: true,
          category: { select: { name: true } },
          _count: { select: { variants: true } },
        },
        orderBy: { [sort]: dir },
        skip,
        take,
      }),
      prisma.product.count({ where }),
    ])
    return NextResponse.json({ rows, rowCount })
  } catch (error) {
    console.error('Failed to fetch products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  refreshStorefront()
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
        stock: parseInt(body.stock) || 0,
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
                  stock: parseInt(v.stock) || 0,
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
