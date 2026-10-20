import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, stripSearchParams } from '@tanstack/react-router'
import { imageSrc } from '@/features/catalog/image'
import { ProductBrowser } from '@/features/catalog/product-browser'
import { categoryQuery, productListQuery } from '@/features/catalog/queries'
import { categoryBrowseSchema, productBrowseDefaults } from '@/features/catalog/schemas'
import { siteSettingsQuery } from '@/features/settings/queries'
import { ShopError } from '@/features/shop-layout/shop-error'

export const Route = createFileRoute('/_shop/categories/$slug')({
  validateSearch: categoryBrowseSchema,
  search: { middlewares: [stripSearchParams(productBrowseDefaults)] },
  loaderDeps: ({ search }) => search,
  loader: async ({ context, deps, params }) => {
    const [settings, category] = await Promise.all([
      context.queryClient.ensureQueryData(siteSettingsQuery),
      context.queryClient.ensureQueryData(categoryQuery(params.slug)),
      context.queryClient.ensureQueryData(productListQuery({ ...deps, category: params.slug })),
    ])
    return { siteName: settings?.siteName ?? '', category }
  },
  head: ({ loaderData }) => {
    const category = loaderData?.category
    const title = [category?.name, loaderData?.siteName].filter(Boolean).join(' – ')
    const description = category?.description || (category ? `Shop ${category.name} at ${loaderData?.siteName}` : '')
    return {
      meta: [
        { title },
        { name: 'description', content: description },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        ...(category?.image ? [{ property: 'og:image', content: category.image }] : []),
      ],
    }
  },
  errorComponent: ShopError,
  component: CategoryPage,
})

function CategoryPage() {
  const { slug } = Route.useParams()
  const search = Route.useSearch()
  const { data: category } = useSuspenseQuery(categoryQuery(slug))
  return (
    <ProductBrowser
      search={{ ...search, category: slug }}
      title={category.name}
      intro={
        (category.description || category.image) && (
          <div className="flex items-center gap-4">
            {category.image && (
              <img
                src={imageSrc(category.image, 160)}
                alt=""
                width={64}
                height={64}
                className="size-16 shrink-0 rounded-full bg-muted object-cover"
              />
            )}
            {category.description && <p className="max-w-3xl text-muted-foreground">{category.description}</p>}
          </div>
        )
      }
      subcategories={category.subcategories}
    />
  )
}
