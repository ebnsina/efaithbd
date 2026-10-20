import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getPage, listPages, savePage } from './pages.functions'
import type { PageInput } from './schemas'

export const pageKeys = {
  all: ['admin', 'pages'] as const,
  list: () => [...pageKeys.all, 'list'] as const,
  detail: (id: string) => [...pageKeys.all, 'detail', id] as const,
}

export const pageListQuery = () => queryOptions({ queryKey: pageKeys.list(), queryFn: () => listPages() })
export const pageQuery = (id: string) =>
  queryOptions({
    queryKey: pageKeys.detail(id),
    queryFn: () => getPage({ data: { id } }),
  })

export function useSavePage(id?: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: PageInput) => savePage({ data: { id, values } }),
    onSuccess: (result) => {
      if (!result.ok) return
      toast.success(id ? 'Page saved' : 'Page created')
      return queryClient.invalidateQueries({ queryKey: pageKeys.all })
    },
    onError: () => toast.error('Could not save this page. Please try again.'),
  })
}
