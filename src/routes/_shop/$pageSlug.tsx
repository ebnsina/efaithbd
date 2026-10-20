import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, notFound } from '@tanstack/react-router'
import { Markdown } from '@/features/pages/markdown'
import { pageQuery } from '@/features/pages/queries'
import { RouteError, RoutePending } from '@/features/pages/route-states'
import { formatDate } from '@/lib/format'

export const Route = createFileRoute('/_shop/$pageSlug')({
  loader: async ({ context, params }) => {
    const page = await context.queryClient.ensureQueryData(pageQuery(params.pageSlug))
    if (!page) throw notFound()
    return page
  },
  head: ({ loaderData: page }) => ({
    meta: page
      ? [
          { title: page.title },
          ...(page.metaDescription ? [{ name: 'description', content: page.metaDescription }] : []),
          { property: 'og:title', content: page.title },
        ]
      : [],
  }),
  pendingComponent: RoutePending,
  errorComponent: RouteError,
  component: ContentPage,
})

function ContentPage() {
  const { pageSlug } = Route.useParams()
  const { data: page } = useSuspenseQuery(pageQuery(pageSlug))
  if (!page) return null

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-semibold text-3xl tracking-tight">{page.title}</h1>
      <p className="mt-2 mb-8 text-muted-foreground text-sm">Last updated {formatDate(page.updatedAt)}</p>
      <Markdown source={page.content} />
    </div>
  )
}
