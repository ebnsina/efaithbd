import * as v from 'valibot'
import { listSearchEntries } from '@/lib/list-search'

const optionalPick = <T extends string>(options: readonly [T, ...T[]]) =>
  v.optional(v.fallback(v.optional(v.picklist(options)), undefined))

export const questionSearchSchema = v.object({
  ...listSearchEntries,
  status: optionalPick(['pending', 'published']),
  answered: optionalPick(['answered', 'unanswered']),
})
export type QuestionSearch = v.InferOutput<typeof questionSearchSchema>

export const answerFormSchema = v.object({
  answer: v.pipe(
    v.string(),
    v.trim(),
    v.nonEmpty('Write an answer'),
    v.maxLength(2000, 'Keep the answer under 2000 characters'),
  ),
})

export const createAnswerSchema = v.object({ questionId: v.string(), values: answerFormSchema })
export const updateAnswerSchema = v.object({ id: v.string(), values: answerFormSchema })
