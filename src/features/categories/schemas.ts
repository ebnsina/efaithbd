import * as v from 'valibot'
import { slugSchema } from '@/features/products/schemas'
import { listSearchEntries } from '@/lib/list-search'

export const categorySearchSchema = v.object(listSearchEntries)
export type CategorySearch = v.InferOutput<typeof categorySearchSchema>

const name = v.pipe(v.string(), v.trim(), v.nonEmpty('Enter a name'), v.maxLength(100, 'Keep the name under 100 characters'))

export const categoryFormSchema = v.object({
  name,
  slug: slugSchema,
  description: v.pipe(v.string(), v.trim(), v.maxLength(1000, 'Keep the description under 1000 characters')),
  image: v.union([v.literal(''), v.pipe(v.string(), v.url())]),
  subcategories: v.pipe(
    v.array(v.object({ id: v.string(), name, slug: slugSchema })),
    v.maxLength(100, 'Add up to 100 subcategories'),
  ),
})
export type CategoryFormValues = v.InferInput<typeof categoryFormSchema>

export const updateCategorySchema = v.object({ id: v.string(), values: categoryFormSchema })
