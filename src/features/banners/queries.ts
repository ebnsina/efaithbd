import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getBanner, listBanners, saveBanner } from './banners.functions'
import type { BannerInput } from './schemas'

export const bannerKeys = {
  all: ['admin', 'banners'] as const,
  list: () => [...bannerKeys.all, 'list'] as const,
  detail: (id: string) => [...bannerKeys.all, 'detail', id] as const,
}

export const bannerListQuery = () => queryOptions({ queryKey: bannerKeys.list(), queryFn: () => listBanners() })
export const bannerQuery = (id: string) =>
  queryOptions({
    queryKey: bannerKeys.detail(id),
    queryFn: () => getBanner({ data: { id } }),
  })

export function useSaveBanner(id?: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: BannerInput) => saveBanner({ data: { id, values } }),
    onSuccess: () => {
      toast.success(id ? 'Banner saved' : 'Banner added')
      return queryClient.invalidateQueries({ queryKey: bannerKeys.all })
    },
    onError: () => toast.error('Could not save this banner. Please check the fields and try again.'),
  })
}
