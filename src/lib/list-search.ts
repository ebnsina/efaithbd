import * as v from 'valibot'

export const PAGE_SIZE = 20

// Shared by route search validation and server function input; bad values fall back instead of erroring
export const listSearchEntries = {
  q: v.optional(v.fallback(v.pipe(v.string(), v.trim(), v.maxLength(100)), ''), ''),
  page: v.optional(v.fallback(v.pipe(v.number(), v.integer(), v.minValue(1)), 1), 1),
  sort: v.optional(v.fallback(v.string(), ''), ''),
  dir: v.optional(v.fallback(v.picklist(['asc', 'desc']), 'desc'), 'desc'),
}

export const listSearchSchema = v.object(listSearchEntries)
export type ListSearch = v.InferOutput<typeof listSearchSchema>
export const listSearchDefaults = { q: '', page: 1, sort: '', dir: 'desc' } as const

export type ListResult<T> = { rows: T[]; rowCount: number }

// Turns list search into Prisma paging; unknown sort keys use the default so callers can't sort by arbitrary columns
export function toPrismaPage<S extends string>(search: ListSearch, sortable: readonly S[], defaultSort: S) {
  const sort = (sortable as readonly string[]).includes(search.sort) ? (search.sort as S) : defaultSort
  return {
    orderBy: { [sort]: search.dir } as Record<S, 'asc' | 'desc'>,
    skip: (search.page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  }
}
