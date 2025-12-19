import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSiteName } from '@/lib/site-settings'
import ProductDetailClient from '@/components/ProductDetailClient'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const [product, siteName] = await Promise.all([
    prisma.product.findUnique({
      where: { slug },
    }),
    getSiteName(),
  ])

  if (!product) {
    return {
      title: 'পণ্য পাওয়া যায়নি',
    }
  }

  return {
    title: `${product.name} - ${siteName}`,
    description: product.description || `Buy ${product.name} from ${siteName}`,
  }
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      subcategory: true,
      variants: {
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  if (!product || !product.active) {
    notFound()
  }

  // Get related products from same category
  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      active: true,
      stock: { gt: 0 },
      id: { not: product.id },
    },
    take: 8,
    orderBy: { createdAt: 'desc' },
  })

  // Get review statistics
  const reviews = await prisma.review.findMany({
    where: {
      productId: product.id,
      approved: true,
    },
    select: {
      rating: true,
    },
  })

  const reviewCount = reviews.length
  const averageRating =
    reviewCount > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
      : 0

  // Get feature cards for the features section
  const featureCards = await prisma.featureCard.findMany({
    where: { active: true },
    orderBy: { order: 'asc' },
    take: 3,
  })

  return (
    <ProductDetailClient
      product={product}
      relatedProducts={relatedProducts}
      reviewStats={{ count: reviewCount, average: averageRating }}
      featureCards={featureCards}
    />
  )
}
