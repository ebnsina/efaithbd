import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const [
      settings,
      banners,
      productSections,
      midBanners,
      featureCards,
      categories,
    ] = await Promise.all([
      prisma.basicSettings.findFirst(),
      prisma.banner.findMany({
        where: { active: true },
        orderBy: { order: 'asc' },
      }),
      prisma.productSection.findMany({
        where: { active: true },
        orderBy: { order: 'asc' },
      }),
      prisma.midBanner.findMany({
        where: { active: true },
        orderBy: { position: 'asc' },
      }),
      prisma.featureCard.findMany({
        where: { active: true },
        orderBy: { order: 'asc' },
      }),
      prisma.category.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
      }),
    ])

    // Fetch products for each section
    const sectionsWithProducts = await Promise.all(
      productSections.map(async section => {
        let products: any[] = []

        switch (section.type) {
          case 'FEATURED':
            products = await prisma.product.findMany({
              where: { featured: true, active: true, stock: { gt: 0 } },
              take: section.limit,
              orderBy: { createdAt: 'desc' },
            })
            break
          case 'NEW_ARRIVAL':
            products = await prisma.product.findMany({
              where: { active: true, stock: { gt: 0 } },
              take: section.limit,
              orderBy: { createdAt: 'desc' },
            })
            break
          case 'HOT_DEALS':
            products = await prisma.product.findMany({
              where: {
                active: true,
                stock: { gt: 0 },
                comparePrice: { not: null },
              },
              take: section.limit,
              orderBy: { createdAt: 'desc' },
            })
            break
          case 'BEST_SELLING':
            // For now, just get recent products
            // Later you can add orderItems count
            products = await prisma.product.findMany({
              where: { active: true, stock: { gt: 0 } },
              take: section.limit,
              orderBy: { createdAt: 'desc' },
            })
            break
          default:
            products = []
        }

        return {
          ...section,
          products,
        }
      })
    )

    return NextResponse.json({
      settings,
      banners,
      productSections: sectionsWithProducts,
      midBanners,
      featureCards,
      categories,
    })
  } catch (error) {
    console.error('Error fetching homepage data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch homepage data' },
      { status: 500 }
    )
  }
}
