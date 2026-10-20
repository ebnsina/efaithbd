import { keepPreviousData, queryOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { deleteCoupon, listCoupons, saveCoupon } from './coupons.functions'
import type { CouponSearch } from './schemas'

const couponKeys = {
  all: ['admin', 'coupons'] as const,
  list: (search: CouponSearch) => [...couponKeys.all, 'list', search] as const,
}

export const couponListQuery = (search: CouponSearch) =>
  queryOptions({
    queryKey: couponKeys.list(search),
    queryFn: () => listCoupons({ data: search }),
    placeholderData: keepPreviousData,
  })

export function useSaveCoupon() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: Parameters<typeof saveCoupon>[0]['data']) => saveCoupon({ data: input }),
    onSuccess: (result) => result.ok && queryClient.invalidateQueries({ queryKey: couponKeys.all }),
  })
}

export function useDeleteCoupon() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteCoupon({ data: { id } }),
    onSuccess: () => {
      toast.success('Coupon deleted')
      return queryClient.invalidateQueries({ queryKey: couponKeys.all })
    },
    onError: () => toast.error('Could not delete this coupon. Please try again.'),
  })
}
