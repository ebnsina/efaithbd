import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, stripSearchParams } from '@tanstack/react-router'
import { ProductBrowser } from '@/features/catalog/product-browser'
import { productListQuery } from '@/features/catalog/queries'
import { productBrowseDefaults, productBrowseSchema } from '@/features/catalog/schemas'
import { siteSettingsQuery } from '@/features/settings/queries'
import { shopLayoutQuery } from '@/features/shop-layout/queries'
import { ShopError } from '@/features/shop-layout/shop-error'

export const Route = createFileRoute('/_shop/products/')({
  validateSearch: productBrowseSchema,
  search: { middlewares: [stripSearchParams(productBrowseDefaults)] },
  loaderDeps: ({ search }) => search,
  loader: async ({ context, deps }) => {
    const [settings] = await Promise.all([
      context.queryClient.ensureQueryData(siteSettingsQuery),
      context.queryClient.ensureQueryData(productListQuery(deps)),
    ])
    return { siteName: settings?.siteName ?? '', q: deps.q }
  },
  head: ({ loaderData }) => {
    const title = [loaderData?.q ? `Search: ${loaderData.q}` : 'All products', loaderData?.siteName]
      .filter(Boolean)
      .join(' – ')
    return { meta: [{ title }, { property: 'og:title', content: title }] }
  },
  errorComponent: ShopError,
  component: ProductsPage,
})

function ProductsPage() {
  const search = Route.useSearch()
  const { data: layout } = useSuspenseQuery(shopLayoutQuery)
  const category = layout.categories.find((c) => c.slug === search.category)
  return (
    <ProductBrowser
      search={search}
      title={search.q ? `Results for “${search.q}”` : (category?.name ?? 'All products')}
      categories={layout.categories}
      subcategories={category?.subcategories ?? []}
    />
  )
}
