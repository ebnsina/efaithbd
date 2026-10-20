import * as v from 'valibot'

export const QUESTIONS_PAGE_SIZE = 10

const id = v.pipe(v.string(), v.maxLength(64))

export const questionFormSchema = v.object({
  question: v.pipe(
    v.string(),
    v.trim(),
    v.minLength(5, 'Write your question (at least 5 characters)'),
    v.maxLength(500, 'Keep your question under 500 characters'),
  ),
})

export const answerFormSchema = v.object({
  answer: v.pipe(
    v.string(),
    v.trim(),
    v.minLength(2, 'Write your answer'),
    v.maxLength(1000, 'Keep your answer under 1,000 characters'),
  ),
})

export const askQuestionSchema = v.object({ ...questionFormSchema.entries, productId: id })
export const answerQuestionSchema = v.object({ ...answerFormSchema.entries, questionId: id })
export const questionListSchema = v.object({ productId: id, page: v.pipe(v.number(), v.integer(), v.minValue(1)) })
