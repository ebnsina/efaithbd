import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { fetchJson } from '@/lib/api'

export interface ShippingMethod {
  id: string
  name: string
  description: string | null
  cost: number
  minOrder: number | null
  maxOrder: number | null
  active: boolean
  order: number
}

export type ShippingMethodInput = Omit<ShippingMethod, 'id'>

const shippingKeys = {
  all: ['admin', 'shipping-methods'] as const,
}

const shippingMethodsOptions = queryOptions({
  queryKey: shippingKeys.all,
  queryFn: () => fetchJson<ShippingMethod[]>('/api/admin/shipping-methods'),
})

export const useShippingMethods = () => useQuery(shippingMethodsOptions)

export function useSaveShippingMethod() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id?: string; data: ShippingMethodInput }) =>
      fetchJson(id ? `/api/admin/shipping-methods/${id}` : '/api/admin/shipping-methods', {
        method: id ? 'PUT' : 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: shippingKeys.all }),
  })
}

export function useDeleteShippingMethod() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => fetchJson(`/api/admin/shipping-methods/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: shippingKeys.all }),
    onError: () => toast.error('Could not delete this shipping method. Please try again.'),
  })
}

export function useReorderShippingMethods() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (items: ShippingMethod[]) =>
      fetchJson('/api/admin/shipping-methods', { method: 'PUT', body: JSON.stringify({ items }) }),
    onMutate: async (items) => {
      await queryClient.cancelQueries({ queryKey: shippingKeys.all })
      const previous = queryClient.getQueryData(shippingMethodsOptions.queryKey)
      queryClient.setQueryData(shippingMethodsOptions.queryKey, items)
      return { previous }
    },
    onError: (_error, _items, context) => {
      queryClient.setQueryData(shippingMethodsOptions.queryKey, context?.previous)
      toast.error('Could not save the new order. Please try again.')
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: shippingKeys.all }),
  })
}
