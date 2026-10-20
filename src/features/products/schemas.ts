import * as v from 'valibot'
import { listSearchEntries } from '@/lib/list-search'

export const adminProductSearchSchema = v.object({
  ...listSearchEntries,
  status: v.optional(v.fallback(v.optional(v.picklist(['active', 'inactive', 'featured'])), undefined)),
})
export type AdminProductSearch = v.InferOutput<typeof adminProductSearchSchema>
