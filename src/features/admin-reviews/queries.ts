import { keepPreviousData, queryOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { deleteReview, listAdminReviews, setReviewApproval } from './admin-reviews.functions'
import type { ReviewSearch } from './schemas'

const adminReviewKeys = {
  all: ['admin', 'reviews'] as const,
  list: (search: ReviewSearch) => [...adminReviewKeys.all, 'list', search] as const,
}

export const adminReviewListQuery = (search: ReviewSearch) =>
  queryOptions({
    queryKey: adminReviewKeys.list(search),
    queryFn: () => listAdminReviews({ data: search }),
    placeholderData: keepPreviousData,
  })

export function useSetReviewApproval() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { id: string; approved: boolean }) => setReviewApproval({ data }),
    onSuccess: (_, { approved }) => {
      toast.success(approved ? 'Review approved. It now shows in the store.' : 'Review hidden from the store')
      return queryClient.invalidateQueries({ queryKey: adminReviewKeys.all })
    },
    onError: () => toast.error('Could not update this review. Please try again.'),
  })
}

export function useDeleteReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteReview({ data: { id } }),
    onSuccess: () => {
      toast.success('Review deleted')
      return queryClient.invalidateQueries({ queryKey: adminReviewKeys.all })
    },
    onError: () => toast.error('Could not delete this review. Please try again.'),
  })
}
