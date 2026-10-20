import { infiniteQueryOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createReview, listReviews, markReviewHelpful } from './reviews.functions'

export const reviewKeys = {
  all: ['reviews'] as const,
  product: (productId: string) => [...reviewKeys.all, productId] as const,
}

export const reviewsQuery = (productId: string) =>
  infiniteQueryOptions({
    queryKey: reviewKeys.product(productId),
    queryFn: ({ pageParam }) => listReviews({ data: { productId, page: pageParam } }),
    initialPageParam: 1,
    getNextPageParam: (last, pages) => (last.hasMore ? pages.length + 1 : undefined),
  })

export function useCreateReview() {
  return useMutation({ mutationFn: createReview })
}

export function useMarkHelpful(productId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => markReviewHelpful({ data: { id } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: reviewKeys.product(productId) }),
    onError: () => toast.error('Could not save that. Please try again.'),
  })
}
