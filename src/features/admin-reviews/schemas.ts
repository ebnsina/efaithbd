import * as v from 'valibot'
import { listSearchEntries } from '@/lib/list-search'

// Non-numeric values so the router keeps them as plain strings in the URL (?rating=5-stars)
export const ratingFilters = ['5-stars', '4-stars', '3-stars', '2-stars', '1-star'] as const

const optionalPick = <T extends string>(options: readonly [T, ...T[]]) =>
  v.optional(v.fallback(v.optional(v.picklist(options)), undefined))

export const reviewSearchSchema = v.object({
  ...listSearchEntries,
  status: optionalPick(['pending', 'approved']),
  rating: optionalPick(ratingFilters),
})
export type ReviewSearch = v.InferOutput<typeof reviewSearchSchema>
