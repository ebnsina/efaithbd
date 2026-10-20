import * as v from 'valibot'

export const PAGE_SIZE = 20

const ListParams = v.object({
  q: v.fallback(v.pipe(v.string(), v.trim(), v.maxLength(100)), ''),
  page: v.fallback(v.pipe(v.string(), v.toNumber(), v.integer(), v.minValue(1)), 1),
  pageSize: v.fallback(v.pipe(v.string(), v.toNumber(), v.integer(), v.minValue(1), v.maxValue(100)), PAGE_SIZE),
  dir: v.fallback(v.picklist(['asc', 'desc']), 'desc'),
})

// Reads ?q=&page=&pageSize=&sort=&dir= from a list request; unknown sort keys fall back to defaultSort
export function parseListParams<S extends string>(
  searchParams: URLSearchParams,
  sortable: readonly S[],
  defaultSort: S
) {
  const { q, page, pageSize, dir } = v.parse(ListParams, {
    q: searchParams.get('q') ?? undefined,
    page: searchParams.get('page') ?? undefined,
    pageSize: searchParams.get('pageSize') ?? undefined,
    dir: searchParams.get('dir') ?? undefined,
  })
  const sortParam = searchParams.get('sort') as S
  const sort = sortable.includes(sortParam) ? sortParam : defaultSort
  return { q, dir, sort, skip: (page - 1) * pageSize, take: pageSize }
}

// Accepts a filter value only if it is one of the allowed options
export const pickParam = <T extends string>(searchParams: URLSearchParams, name: string, allowed: readonly T[]) => {
  const value = searchParams.get(name) as T
  return allowed.includes(value) ? value : undefined
}
