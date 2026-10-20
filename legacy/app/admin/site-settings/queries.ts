import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { fetchJson } from '@/lib/api'

export interface MenuItem {
  id: string
  label: string
  url: string
  parentId: string | null
  type: 'CUSTOM' | 'CATEGORY' | 'PRODUCT' | 'PAGE'
  targetId: string | null
  icon: string | null
  order: number
  active: boolean
  openInNewTab: boolean
  megaMenu: boolean
  featured: boolean
  children?: MenuItem[]
}

type Settings = { id?: string } & Record<string, unknown>

const settingsKeys = {
  all: ['admin', 'site-settings'] as const,
  basic: () => [...settingsKeys.all, 'basic'] as const,
  footer: () => [...settingsKeys.all, 'footer'] as const,
  menu: () => [...settingsKeys.all, 'menu'] as const,
}

const basicOptions = queryOptions({
  queryKey: settingsKeys.basic(),
  queryFn: () => fetchJson<Settings>('/api/admin/site-settings/basic'),
})
const footerOptions = queryOptions({
  queryKey: settingsKeys.footer(),
  queryFn: () => fetchJson<Settings>('/api/admin/site-settings/footer'),
})
const menuOptions = queryOptions({
  queryKey: settingsKeys.menu(),
  queryFn: () => fetchJson<MenuItem[]>('/api/admin/menu'),
})

export const useBasicSettings = (enabled: boolean) => useQuery({ ...basicOptions, enabled })
export const useFooterSettings = (enabled: boolean) => useQuery({ ...footerOptions, enabled })
export const useMenuItems = (enabled: boolean) => useQuery({ ...menuOptions, enabled })

function useSaveSettings(url: string, queryKey: readonly string[]) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: object) => fetchJson<Settings>(url, { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: (saved) => queryClient.setQueryData(queryKey, saved),
  })
}

export const useSaveBasicSettings = () => useSaveSettings('/api/admin/site-settings/basic', settingsKeys.basic())
export const useSaveFooterSettings = () => useSaveSettings('/api/admin/site-settings/footer', settingsKeys.footer())

export function useSaveMenuItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id?: string; data: object }) =>
      fetchJson(id ? `/api/admin/menu/${id}` : '/api/admin/menu', {
        method: id ? 'PUT' : 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: settingsKeys.menu() }),
  })
}

export function useDeleteMenuItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => fetchJson(`/api/admin/menu/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: settingsKeys.menu() }),
    onError: () => toast.error('Could not delete this menu item. Please try again.'),
  })
}

export function useReorderMenuItems() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (items: MenuItem[]) =>
      fetchJson('/api/admin/menu', { method: 'PUT', body: JSON.stringify({ items }) }),
    onMutate: async (items) => {
      await queryClient.cancelQueries({ queryKey: menuOptions.queryKey })
      const previous = queryClient.getQueryData(menuOptions.queryKey)
      queryClient.setQueryData(menuOptions.queryKey, items)
      return { previous }
    },
    onError: (_error, _items, context) => {
      queryClient.setQueryData(menuOptions.queryKey, context?.previous)
      toast.error('Could not save the new menu order. Please try again.')
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: menuOptions.queryKey }),
  })
}
