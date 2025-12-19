import { prisma } from '@/lib/prisma'
import { getSiteSettings } from '@/lib/site-settings'
import ProductFilterClient from '@/components/ProductFilterClient'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  const siteName = settings?.siteName || 'Online Store'
  
  return {
    title: `Products - ${siteName}`,
    description: `Browse all products at ${siteName}. Find the best deals and quality products.`,
  }
}

interface SearchParams {
  category?: string
  subcategory?: string
  search?: string
  minPrice?: string
  maxPrice?: string
  rating?: string
  sort?: string
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const { category, subcategory, search, minPrice, maxPrice, rating, sort } =
    await searchParams

  // Build where clause
  const where: any = {
    active: true,
  }

  if (category) {
    where.category = { slug: category }
  }

  if (subcategory) {
    where.subcategory = { slug: subcategory }
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ]
  }

  if (minPrice || maxPrice) {
    where.price = {}
    if (minPrice) where.price.gte = parseFloat(minPrice)
    if (maxPrice) where.price.lte = parseFloat(maxPrice)
  }

  if (rating) {
    where.rating = { gte: parseFloat(rating) }
  }

  // Build orderBy clause
  let orderBy: any = { createdAt: 'desc' }
  if (sort === 'price-asc') orderBy = { price: 'asc' }
  if (sort === 'price-desc') orderBy = { price: 'desc' }
  if (sort === 'name-asc') orderBy = { name: 'asc' }
  if (sort === 'rating') orderBy = { rating: 'desc' }

  const [products, categories, allSubcategories] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: true,
        subcategory: true,
      },
      orderBy,
    }),
    prisma.category.findMany({
      orderBy: { name: 'asc' },
    }),
    prisma.subCategory.findMany({
      include: {
        category: true,
      },
      orderBy: { name: 'asc' },
    }),
  ])

  return (
    <ProductFilterClient
      initialProducts={products}
      categories={categories}
      subcategories={allSubcategories}
      initialFilters={{
        category,
        subcategory,
        search,
        minPrice,
        maxPrice,
        rating,
        sort,
      }}
    />
  )
}
