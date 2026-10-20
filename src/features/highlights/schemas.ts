import * as v from 'valibot'
import { optionalLink, optionalText, requiredText } from '@/features/site-settings/fields'
import { highlightIconKeys } from './icons'

export const highlightSchema = v.object({
  title: requiredText('Enter a title', 60),
  subtitle: optionalText(120),
  icon: v.picklist(highlightIconKeys, 'Choose an icon'),
  link: optionalLink(),
  active: v.boolean(),
})
export type HighlightInput = v.InferInput<typeof highlightSchema>
