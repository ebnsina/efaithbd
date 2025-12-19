import { prisma } from '@/lib/prisma'
import { getSiteSettings } from '@/lib/site-settings'
import BannerCarousel from '@/components/BannerCarousel'
import CategoryGrid from '@/components/CategoryGrid'
import ProductCarousel from '@/components/ProductCarousel'
import MidBanner from '@/components/MidBanner'
import FeatureCards from '@/components/FeatureCards'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  const siteName = settings?.siteName || 'Online Store'
  
  return {
    title: settings?.metaTitle || `${siteName} - Online Shopping`,
    description: settings?.metaDescription || settings?.siteDescription || `Welcome to ${siteName} - Best online shopping platform`,
    keywords: settings?.metaKeywords || undefined,
    openGraph: {
      title: settings?.metaTitle || `${siteName} - Online Shopping`,
      description: settings?.metaDescription || settings?.siteDescription || `Welcome to ${siteName}`,
      images: settings?.ogImage ? [settings.ogImage] : undefined,
      siteName: siteName,
    },
  }
}

export default async function Home() {
  // Fetch all homepage data
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
      take: 12,
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
            include: {
              variants: {
                select: {
                  id: true,
                  name: true,
                  value: true,
                  price: true,
                  stock: true,
                },
              },
            },
          })
          break
        case 'NEW_ARRIVAL':
          products = await prisma.product.findMany({
            where: { active: true, stock: { gt: 0 } },
            take: section.limit,
            orderBy: { createdAt: 'desc' },
            include: {
              variants: {
                select: {
                  id: true,
                  name: true,
                  value: true,
                  price: true,
                  stock: true,
                },
              },
            },
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
            include: {
              variants: {
                select: {
                  id: true,
                  name: true,
                  value: true,
                  price: true,
                  stock: true,
                },
              },
            },
          })
          break
        case 'BEST_SELLING':
          products = await prisma.product.findMany({
            where: { active: true, stock: { gt: 0 } },
            take: section.limit,
            orderBy: { createdAt: 'desc' },
            include: {
              variants: {
                select: {
                  id: true,
                  name: true,
                  value: true,
                  price: true,
                  stock: true,
                },
              },
            },
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

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Banner Carousel */}
      {banners.length > 0 && (
        <div className="container mx-auto px-4 sm:px-6 lg:px-0 pt-6 pb-8">
          <BannerCarousel banners={banners} />
        </div>
      )}

      {/* Categories Grid */}
      {categories.length > 0 && (
        <div className="py-12">
          <CategoryGrid categories={categories} />
        </div>
      )}

      {/* Product Sections with Mid Banners */}
      <div className="space-y-16 pb-16">
        {sectionsWithProducts.map((section, index) => (
          <div key={section.id}>
            <ProductCarousel
              title={section.title}
              products={section.products}
            />

            {/* Insert mid banner after specific sections */}
            {midBanners
              .filter(banner => banner.position === index + 1)
              .map(banner => (
                <MidBanner
                  key={banner.id}
                  title={banner.title}
                  subtitle={banner.subtitle}
                  image={banner.image}
                  link={banner.link}
                />
              ))}
          </div>
        ))}
      </div>

      {/* Feature Cards */}
      {featureCards.length > 0 && <FeatureCards cards={featureCards} />}
    </div>
  )
}
