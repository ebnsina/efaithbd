import * as v from 'valibot'
import { optionalLink, optionalText, requiredImage } from '@/features/site-settings/fields'

export const bannerSchema = v.object({
  title: optionalText(120),
  subtitle: optionalText(200),
  image: requiredImage('Add a banner image'),
  link: optionalLink(),
  active: v.boolean(),
})
export type BannerInput = v.InferInput<typeof bannerSchema>
