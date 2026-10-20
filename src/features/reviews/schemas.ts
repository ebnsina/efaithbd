import * as v from 'valibot'

export const REVIEWS_PAGE_SIZE = 10

export const reviewFormSchema = v.object({
  rating: v.pipe(v.number(), v.integer(), v.minValue(1, 'Choose a rating'), v.maxValue(5)),
  title: v.pipe(v.string(), v.trim(), v.maxLength(120, 'Keep the title under 120 characters')),
  comment: v.pipe(
    v.string(),
    v.trim(),
    v.minLength(10, 'Tell us a little more (at least 10 characters)'),
    v.maxLength(2000, 'Keep your review under 2,000 characters'),
  ),
})

export const createReviewSchema = v.object({ ...reviewFormSchema.entries, productId: v.pipe(v.string(), v.maxLength(64)) })

export const reviewListSchema = v.object({
  productId: v.pipe(v.string(), v.maxLength(64)),
  page: v.pipe(v.number(), v.integer(), v.minValue(1)),
})

export const reviewIdSchema = v.object({ id: v.pipe(v.string(), v.maxLength(64)) })
