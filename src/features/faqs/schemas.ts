import * as v from 'valibot'
import { requiredText } from '@/features/site-settings/fields'

export const faqSchema = v.object({
  question: requiredText('Enter the question', 300),
  answer: requiredText('Enter the answer', 3000),
  active: v.boolean(),
})
export type FaqInput = v.InferInput<typeof faqSchema>
