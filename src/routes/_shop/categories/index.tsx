import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { imageSrc } from '@/features/catalog/image'
import { categoryListQuery } from '@/features/catalog/queries'
import { siteSettingsQuery } from '@/features/settings/queries'
import { ShopError } from '@/features/shop-layout/shop-error'
import { formatNumber } from '@/lib/format'

export const Route = createFileRoute('/_shop/categories/')({
  loader: async ({ context }) => {
    const [settings] = await Promise.all([
      context.queryClient.ensureQueryData(siteSettingsQuery),
      context.queryClient.ensureQueryData(categoryListQuery),
    ])
    return { siteName: settings?.siteName ?? '' }
  },
  head: ({ loaderData }) => {
    const title = ['Categories', loaderData?.siteName].filter(Boolean).join(' – ')
    return { meta: [{ title }, { property: 'og:title', content: title }] }
  },
  errorComponent: ShopError,
  component: CategoriesPage,
})

function CategoriesPage() {
  const { data: categories } = useSuspenseQuery(categoryListQuery)
  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <h1 className="mb-6 font-bold text-2xl md:text-3xl">Categories</h1>
      {categories.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyTitle>No categories yet</EmptyTitle>
            <EmptyDescription>Please check back soon.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 xl:grid-cols-6">
          {categories.map((category) => (
            <li key={category.id}>
              <Link
                to="/categories/$slug"
                params={{ slug: category.slug }}
                className="group block overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md"
              >
                <span className="relative flex aspect-square items-center justify-center overflow-hidden bg-muted font-semibold text-4xl text-muted-foreground">
                  {category.image ? (
                    <img
                      src={imageSrc(category.image, 400)}
                      alt=""
                      width={400}
                      height={400}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 size-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    category.name.charAt(0)
                  )}
                </span>
                <span className="block p-3 text-center">
                  <span className="line-clamp-2 font-medium text-sm group-hover:text-primary">{category.name}</span>
                  <span className="text-muted-foreground text-xs">
                    {category._count.products === 1 ? '1 product' : `${formatNumber(category._count.products)} products`}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
