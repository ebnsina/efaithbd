import { queryOptions } from '@tanstack/react-query'
import { getPublishedPage } from './pages.functions'

const pageKeys = {
  all: ['pages'] as const,
  detail: (slug: string) => [...pageKeys.all, slug] as const,
}

export const pageQuery = (slug: string) =>
  queryOptions({ queryKey: pageKeys.detail(slug), queryFn: () => getPublishedPage({ data: { slug } }) })
