import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, getRouteApi, Link } from '@tanstack/react-router'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProductGrid } from '@/features/catalog/product-card'
import { ProductGallery, PurchasePanel } from '@/features/catalog/product-detail'
import { productQuery } from '@/features/catalog/queries'
import { ProductQuestions } from '@/features/questions/product-questions'
import { questionsQuery } from '@/features/questions/queries'
import { ProductReviews } from '@/features/reviews/product-reviews'
import { reviewsQuery } from '@/features/reviews/queries'
import { siteSettingsQuery } from '@/features/settings/queries'
import { ShopError } from '@/features/shop-layout/shop-error'
import { formatNumber } from '@/lib/format'

const shopRoute = getRouteApi('/_shop')

export const Route = createFileRoute('/_shop/products/$slug')({
  loader: async ({ context: { queryClient }, params }) => {
    const [settings, { product }] = await Promise.all([
      queryClient.ensureQueryData(siteSettingsQuery),
      queryClient.ensureQueryData(productQuery(params.slug)),
    ])
    await Promise.all([
      queryClient.ensureInfiniteQueryData(reviewsQuery(product.id)),
      queryClient.ensureInfiniteQueryData(questionsQuery(product.id)),
    ])
    return {
      siteName: settings?.siteName ?? '',
      name: product.name,
      description: product.description,
      image: product.images[0],
    }
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {}
    const title = [loaderData.name, loaderData.siteName].filter(Boolean).join(' – ')
    const description = loaderData.description.replace(/\s+/g, ' ').slice(0, 160)
    return {
      meta: [
        { title },
        { name: 'description', content: description },
        { property: 'og:type', content: 'product' },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        ...(loaderData.image ? [{ property: 'og:image', content: loaderData.image }] : []),
      ],
    }
  },
  errorComponent: ShopError,
  component: ProductPage,
})

function ProductPage() {
  const { slug } = Route.useParams()
  const { user } = shopRoute.useLoaderData()
  const { data: settings } = useSuspenseQuery(siteSettingsQuery)
  const {
    data: { product, related, featureCards },
  } = useSuspenseQuery(productQuery(slug))
  const showReviews = settings?.enableReviews !== false

  return (
    <div className="container mx-auto space-y-8 px-4 py-4 md:py-6">
      <nav aria-label="Breadcrumb" className="overflow-x-auto text-muted-foreground text-sm">
        <ol className="flex items-center gap-1.5 whitespace-nowrap">
          <li>
            <Link to="/" className="hover:text-foreground">
              Home
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link to="/categories/$slug" params={{ slug: product.category.slug }} className="hover:text-foreground">
              {product.category.name}
            </Link>
          </li>
          {product.subcategory && (
            <>
              <li aria-hidden>/</li>
              <li>
                <Link
                  to="/categories/$slug"
                  params={{ slug: product.category.slug }}
                  search={{ subcategory: product.subcategory.slug }}
                  className="hover:text-foreground"
                >
                  {product.subcategory.name}
                </Link>
              </li>
            </>
          )}
          <li aria-hidden>/</li>
          <li aria-current="page" className="truncate text-foreground">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="grid gap-6 md:grid-cols-2 lg:gap-10">
        <ProductGallery name={product.name} images={product.images} />
        <PurchasePanel product={product} featureCards={featureCards} />
      </div>

      <Tabs defaultValue="description" id="reviews" className="scroll-mt-40 rounded-xl border p-4 md:p-6">
        <TabsList className="mb-4 w-full justify-start overflow-x-auto">
          <TabsTrigger value="description">Description</TabsTrigger>
          {showReviews && (
            <TabsTrigger value="reviews">
              Reviews{product.reviewCount > 0 && ` (${formatNumber(product.reviewCount)})`}
            </TabsTrigger>
          )}
          <TabsTrigger value="questions">Questions</TabsTrigger>
        </TabsList>
        <TabsContent value="description">
          {product.description.trim() ? (
            <p className="max-w-3xl whitespace-pre-line leading-relaxed">{product.description}</p>
          ) : (
            <p className="text-muted-foreground">No description yet.</p>
          )}
        </TabsContent>
        {showReviews && (
          <TabsContent value="reviews">
            <ProductReviews productId={product.id} signedIn={!!user} />
          </TabsContent>
        )}
        <TabsContent value="questions">
          <ProductQuestions productId={product.id} signedIn={!!user} />
        </TabsContent>
      </Tabs>

      {related.length > 0 && (
        <section aria-labelledby="related" className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 id="related" className="font-semibold text-xl md:text-2xl">
              You may also like
            </h2>
            <Link
              to="/categories/$slug"
              params={{ slug: product.category.slug }}
              className="font-medium text-primary text-sm hover:underline"
            >
              See all
            </Link>
          </div>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  )
}
