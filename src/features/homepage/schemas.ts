import * as v from 'valibot'
import { optionalLink, optionalText, requiredImage, requiredText } from '@/features/site-settings/fields'

export const sectionTypes = [
  { value: 'FEATURED', label: 'Featured products' },
  { value: 'NEW_ARRIVAL', label: 'New arrivals' },
  { value: 'HOT_DEALS', label: 'Hot deals' },
  { value: 'BEST_SELLING', label: 'Best sellers' },
] as const
export const sectionTypeLabel = (type: string) => sectionTypes.find((t) => t.value === type)?.label ?? type

export const sectionSchema = v.object({
  title: requiredText('Enter a title', 80),
  type: v.picklist(
    sectionTypes.map((t) => t.value),
    'Choose which products to show'
  ),
  limit: v.pipe(
    v.number('Enter how many products to show'),
    v.integer('Use a whole number'),
    v.minValue(1, 'Show at least 1 product'),
    v.maxValue(50, 'Show at most 50 products')
  ),
  active: v.boolean(),
})
export type SectionInput = v.InferInput<typeof sectionSchema>

export const featureCardSchema = v.object({
  icon: requiredText('Pick or type an icon', 40),
  title: requiredText('Enter a title', 60),
  description: optionalText(200),
  active: v.boolean(),
})
export type FeatureCardInput = v.InferInput<typeof featureCardSchema>

export const midBannerSchema = v.object({
  title: optionalText(120),
  subtitle: optionalText(200),
  image: requiredImage('Add a banner image'),
  link: optionalLink(),
  // Kept as text in the form because it comes from a select
  position: v.pipe(
    v.string(),
    v.regex(/^\d{1,2}$/, 'Choose where to show it'),
    v.transform(Number),
    v.minValue(1, 'Choose where to show it')
  ),
  active: v.boolean(),
})
export type MidBannerInput = v.InferInput<typeof midBannerSchema>
