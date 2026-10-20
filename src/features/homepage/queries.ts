import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getFeatureCard, getHomepage, getMidBanner, getSection } from './homepage.functions'

export const homepageKeys = {
  all: ['admin', 'homepage'] as const,
  overview: () => [...homepageKeys.all, 'overview'] as const,
  item: (kind: string, id: string) => [...homepageKeys.all, kind, id] as const,
}

export const homepageQuery = () =>
  queryOptions({
    queryKey: homepageKeys.overview(),
    queryFn: () => getHomepage(),
  })
export const sectionQuery = (id: string) =>
  queryOptions({
    queryKey: homepageKeys.item('section', id),
    queryFn: () => getSection({ data: { id } }),
  })
export const featureCardQuery = (id: string) =>
  queryOptions({
    queryKey: homepageKeys.item('feature-card', id),
    queryFn: () => getFeatureCard({ data: { id } }),
  })
export const midBannerQuery = (id: string) =>
  queryOptions({
    queryKey: homepageKeys.item('mid-banner', id),
    queryFn: () => getMidBanner({ data: { id } }),
  })

export type Homepage = Awaited<ReturnType<typeof getHomepage>>

// One hook for the three homepage editors; `noun` is used in the messages
export function useSaveHomepageItem<I>(
  save: (args: { data: { id?: string; values: I } }) => Promise<unknown>,
  id: string | undefined,
  noun: string,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: I) => save({ data: { id, values } }),
    onSuccess: () => {
      toast.success(id ? `${noun} saved` : `${noun} added`)
      return queryClient.invalidateQueries({ queryKey: homepageKeys.all })
    },
    onError: () => toast.error(`Could not save this ${noun.toLowerCase()}. Please check the fields and try again.`),
  })
}
