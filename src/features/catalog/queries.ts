import { keepPreviousData, queryOptions } from '@tanstack/react-query'
import { getCategory, getHomepage, getProduct, listCategories, listProducts } from './catalog.functions'
import type { ProductBrowse } from './schemas'

export const catalogKeys = {
  all: ['catalog'] as const,
  home: () => [...catalogKeys.all, 'home'] as const,
  products: (search: ProductBrowse) => [...catalogKeys.all, 'products', search] as const,
  categories: () => [...catalogKeys.all, 'categories'] as const,
  category: (slug: string) => [...catalogKeys.all, 'category', slug] as const,
  product: (slug: string) => [...catalogKeys.all, 'product', slug] as const,
}

export const homepageQuery = queryOptions({ queryKey: catalogKeys.home(), queryFn: () => getHomepage() })

export const productListQuery = (search: ProductBrowse) =>
  queryOptions({
    queryKey: catalogKeys.products(search),
    queryFn: () => listProducts({ data: search }),
    placeholderData: keepPreviousData,
  })

export const categoryListQuery = queryOptions({ queryKey: catalogKeys.categories(), queryFn: () => listCategories() })

export const categoryQuery = (slug: string) =>
  queryOptions({ queryKey: catalogKeys.category(slug), queryFn: () => getCategory({ data: { slug } }) })

export const productQuery = (slug: string) =>
  queryOptions({ queryKey: catalogKeys.product(slug), queryFn: () => getProduct({ data: { slug } }) })
