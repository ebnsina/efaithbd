import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { deleteShippingMethod, listShippingMethods, reorderShippingMethods, saveShippingMethod } from './shipping.functions'

export type ShippingMethod = Awaited<ReturnType<typeof listShippingMethods>>[number]

export const shippingMethodsQuery = queryOptions({
  queryKey: ['admin', 'shipping-methods'],
  queryFn: () => listShippingMethods(),
})
const key = shippingMethodsQuery.queryKey

export function useSaveShippingMethod() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: Parameters<typeof saveShippingMethod>[0]['data']) => saveShippingMethod({ data: input }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
  })
}

export function useDeleteShippingMethod() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteShippingMethod({ data: { id } }),
    onSuccess: () => {
      toast.success('Shipping method deleted')
      return queryClient.invalidateQueries({ queryKey: key })
    },
    onError: () => toast.error('Could not delete this shipping method. Please try again.'),
  })
}

export function useReorderShippingMethods() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (methods: ShippingMethod[]) => reorderShippingMethods({ data: { ids: methods.map((m) => m.id) } }),
    onMutate: async (methods) => {
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData(key)
      queryClient.setQueryData(key, methods)
      return { previous }
    },
    onSuccess: () => toast.success('New order saved'),
    onError: (_error, _methods, context) => {
      queryClient.setQueryData(key, context?.previous)
      toast.error('Could not save the new order. Please try again.')
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  })
}
