import { createServerFn } from '@tanstack/react-start'
import { notFound } from '@tanstack/react-router'
import type { Prisma, ProductSectionType } from '@/generated/client/client'
import { prisma } from '@/server/db.server'
import { PRODUCTS_PAGE_SIZE, type ProductSort, productBrowseSchema, slugSchema } from './schemas'

const cardSelect = {
  id: true,
  name: true,
  slug: true,
  price: true,
  comparePrice: true,
  images: true,
  stock: true,
  rating: true,
  reviewCount: true,
  _count: { select: { variants: true } },
} satisfies Prisma.ProductSelect

type CardRow = Prisma.ProductGetPayload<{ select: typeof cardSelect }>

// Cards only ever show the first image, so the rest of the array never leaves the server
const toCard = ({ images, _count, ...product }: CardRow) => ({
  ...product,
  image: images[0] ?? null,
  hasVariants: _count.variants > 0,
})
export type ProductCardData = ReturnType<typeof toCard>

const sectionOrder: Record<ProductSectionType, Prisma.ProductOrderByWithRelationInput[]> = {
  FEATURED: [{ createdAt: 'desc' }],
  NEW_ARRIVAL: [{ createdAt: 'desc' }],
  HOT_DEALS: [{ createdAt: 'desc' }],
  BEST_SELLING: [{ orderItems: { _count: 'desc' } }, { createdAt: 'desc' }],
}

export const getHomepage = createServerFn().handler(async () => {
  const sectionWhere: Record<ProductSectionType, Prisma.ProductWhereInput> = {
    FEATURED: { featured: true },
    NEW_ARRIVAL: {},
    HOT_DEALS: { comparePrice: { gt: prisma.product.fields.price } },
    BEST_SELLING: {},
  }
  const [banners, sections, midBanners, featureCards, highlights, categories] = await Promise.all([
    prisma.banner.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
      select: { id: true, title: true, subtitle: true, image: true, link: true },
    }),
    prisma.productSection.findMany({
      where: { active: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      select: { id: true, title: true, type: true, limit: true },
    }),
    prisma.midBanner.findMany({
      where: { active: true },
      orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
      select: { id: true, title: true, subtitle: true, image: true, link: true, position: true },
    }),
    prisma.featureCard.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
      select: { id: true, title: true, description: true, icon: true },
    }),
    prisma.highlight.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
      select: { id: true, title: true, subtitle: true, icon: true, link: true },
    }),
    prisma.category.findMany({
      take: 12,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, slug: true, image: true },
    }),
  ])
  const sectionProducts = await Promise.all(
    sections.map((section) =>
      prisma.product.findMany({
        where: { active: true, stock: { gt: 0 }, ...sectionWhere[section.type] },
        orderBy: sectionOrder[section.type],
        take: Math.min(Math.max(section.limit, 1), 24),
        select: cardSelect,
      }),
    ),
  )
  return {
    banners,
    midBanners,
    featureCards,
    highlights,
    categories,
    sections: sections.map((section, i) => ({
      id: section.id,
      title: section.title,
      products: sectionProducts[i].map(toCard),
    })),
  }
})

const sortOrder: Record<ProductSort, Prisma.ProductOrderByWithRelationInput> = {
  newest: { createdAt: 'desc' },
  'price-asc': { price: 'asc' },
  'price-desc': { price: 'desc' },
  rating: { rating: 'desc' },
  name: { name: 'asc' },
}

export const listProducts = createServerFn()
  .validator(productBrowseSchema)
  .handler(async ({ data: search }) => {
    const { q, category, subcategory, minPrice, maxPrice, rating, sort, page } = search
    // Price filter is left out of `base` so the price hint shows the full range for the other filters
    const base: Prisma.ProductWhereInput = {
      active: true,
      ...(category && { category: { slug: category } }),
      ...(subcategory && { subcategory: { slug: subcategory } }),
      ...(rating && { rating: { gte: rating } }),
      ...(q && {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ],
      }),
    }
    const where: Prisma.ProductWhereInput = {
      ...base,
      ...((minPrice !== undefined || maxPrice !== undefined) && { price: { gte: minPrice, lte: maxPrice } }),
    }
    const [rows, rowCount, range] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: [sortOrder[sort], { id: 'asc' }],
        skip: (page - 1) * PRODUCTS_PAGE_SIZE,
        take: PRODUCTS_PAGE_SIZE,
        select: cardSelect,
      }),
      prisma.product.count({ where }),
      prisma.product.aggregate({ where: base, _min: { price: true }, _max: { price: true } }),
    ])
    return {
      rows: rows.map(toCard),
      rowCount,
      pageCount: Math.ceil(rowCount / PRODUCTS_PAGE_SIZE),
      priceRange: { min: range._min.price, max: range._max.price },
    }
  })

export const listCategories = createServerFn().handler(() =>
  prisma.category.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      slug: true,
      image: true,
      _count: { select: { products: { where: { active: true } } } },
    },
  }),
)

export const getCategory = createServerFn()
  .validator(slugSchema)
  .handler(async ({ data }) => {
    const category = await prisma.category.findUnique({
      where: { slug: data.slug },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image: true,
        subcategories: {
          orderBy: { name: 'asc' },
          select: { id: true, name: true, slug: true },
        },
      },
    })
    if (!category) throw notFound()
    return category
  })

export const getProduct = createServerFn()
  .validator(slugSchema)
  .handler(async ({ data }) => {
    const product = await prisma.product.findUnique({
      where: { slug: data.slug, active: true },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        price: true,
        comparePrice: true,
        stock: true,
        images: true,
        rating: true,
        reviewCount: true,
        categoryId: true,
        category: { select: { name: true, slug: true } },
        subcategory: { select: { name: true, slug: true } },
        variants: {
          orderBy: { createdAt: 'asc' },
          select: { id: true, name: true, value: true, price: true, stock: true },
        },
      },
    })
    if (!product) throw notFound()
    const { categoryId, ...rest } = product
    const [related, featureCards] = await Promise.all([
      prisma.product.findMany({
        where: { categoryId, active: true, stock: { gt: 0 }, id: { not: product.id } },
        orderBy: { createdAt: 'desc' },
        take: 8,
        select: cardSelect,
      }),
      prisma.featureCard.findMany({
        where: { active: true },
        orderBy: { order: 'asc' },
        take: 4,
        select: { id: true, title: true, description: true, icon: true },
      }),
    ])
    return { product: rest, related: related.map(toCard), featureCards }
  })
