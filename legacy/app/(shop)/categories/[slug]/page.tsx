import { prisma } from '@/lib/prisma'
import { getSiteName } from '@/lib/site-settings'
import { notFound } from 'next/navigation'
import CategoryProductsClient from '@/components/CategoryProductsClient'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const [category, siteName] = await Promise.all([
    prisma.category.findUnique({
      where: { slug },
    }),
    getSiteName(),
  ])

  if (!category) {
    return {
      title: 'Category Not Found',
    }
  }

  return {
    title: `${category.name} - ${siteName}`,
    description: category.description || `Shop ${category.name} products at ${siteName}`,
  }
}

interface PageProps {
  params: Promise<{
    slug: string
  }>
  searchParams: Promise<{
    subcategory?: string
    search?: string
    minPrice?: string
    maxPrice?: string
    rating?: string
    sort?: string
  }>
}

export default async function CategoryPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params
  const { subcategory, search, minPrice, maxPrice, rating, sort } =
    await searchParams

  // Fetch the category
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      _count: {
        select: { products: true },
      },
    },
  })

  if (!category) {
    notFound()
  }

  // Build where clause for products
  const where: any = {
    active: true,
    categoryId: category.id,
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

  // Fetch products and subcategories
  const [products, subcategories] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: true,
        subcategory: true,
        variants: true,
      },
      orderBy,
    }),
    prisma.subCategory.findMany({
      where: { categoryId: category.id },
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' },
    }),
  ])

  return (
    <CategoryProductsClient
      category={category}
      initialProducts={products}
      subcategories={subcategories}
      initialFilters={{
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
