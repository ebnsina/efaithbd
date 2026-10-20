import * as v from 'valibot'
import { listSearchEntries } from '@/lib/list-search'

export const PRODUCTS_PAGE_SIZE = 12

export const productSorts = [
  { value: 'newest', label: 'Newest first' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'rating', label: 'Top rated' },
  { value: 'name', label: 'Name: A to Z' },
] as const
export type ProductSort = (typeof productSorts)[number]['value']

const optional = <T extends v.GenericSchema>(schema: T) => v.optional(v.fallback(v.optional(schema), undefined))
const slug = v.pipe(v.string(), v.trim(), v.minLength(1), v.maxLength(200))
const price = v.pipe(v.number(), v.minValue(0), v.maxValue(100_000_000))

// Bad values in the URL fall back to "no filter" instead of showing an error page
export const productBrowseEntries = {
  q: listSearchEntries.q,
  page: listSearchEntries.page,
  sort: v.optional(
    v.fallback(v.picklist(productSorts.map((s) => s.value) as [ProductSort, ...ProductSort[]]), 'newest'),
    'newest',
  ),
  subcategory: optional(slug),
  minPrice: optional(price),
  maxPrice: optional(price),
  rating: optional(v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(5))),
}

export const categoryBrowseSchema = v.object(productBrowseEntries)
export const productBrowseSchema = v.object({ ...productBrowseEntries, category: optional(slug) })
export type ProductBrowse = v.InferOutput<typeof productBrowseSchema>
export const productBrowseDefaults = { q: '', page: 1, sort: 'newest' } as const

export const slugSchema = v.object({ slug })
