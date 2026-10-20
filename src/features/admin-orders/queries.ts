import { keepPreviousData, queryOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { ListResult } from '@/lib/list-search'
import { getAdminOrder, listAdminOrders, updateOrder } from './admin-orders.functions'
import type { AdminOrderSearch, UpdateOrderInput } from './schemas'

const adminOrderKeys = {
  all: ['admin', 'orders'] as const,
  lists: ['admin', 'orders', 'list'] as const,
  list: (search: AdminOrderSearch) => [...adminOrderKeys.lists, search] as const,
  detail: (id: string) => [...adminOrderKeys.all, 'detail', id] as const,
}

export const adminOrderListQuery = (search: AdminOrderSearch) =>
  queryOptions({
    queryKey: adminOrderKeys.list(search),
    queryFn: () => listAdminOrders({ data: search }),
    placeholderData: keepPreviousData,
  })

export const adminOrderQuery = (id: string) =>
  queryOptions({
    queryKey: adminOrderKeys.detail(id),
    queryFn: () => getAdminOrder({ data: { id } }),
  })

type OrderRow = Awaited<ReturnType<typeof listAdminOrders>>['rows'][number]
type OrderDetail = Awaited<ReturnType<typeof getAdminOrder>>

export function useUpdateOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateOrderInput) => updateOrder({ data: input }),
    onMutate: async ({ id, ...changes }) => {
      await queryClient.cancelQueries({ queryKey: adminOrderKeys.all })
      const lists = queryClient.getQueriesData<ListResult<OrderRow>>({
        queryKey: adminOrderKeys.lists,
      })
      const detail = queryClient.getQueryData<OrderDetail>(adminOrderKeys.detail(id))
      queryClient.setQueriesData<ListResult<OrderRow>>(
        { queryKey: adminOrderKeys.lists },
        (old) =>
          old && {
            ...old,
            rows: old.rows.map((row) => (row.id === id ? { ...row, ...changes } : row)),
          },
      )
      queryClient.setQueryData<OrderDetail>(adminOrderKeys.detail(id), (old) => old && { ...old, ...changes })
      return { lists, detail }
    },
    onSuccess: () => toast.success('Order updated'),
    onError: (_error, { id }, context) => {
      for (const [key, data] of context?.lists ?? []) queryClient.setQueryData(key, data)
      queryClient.setQueryData(adminOrderKeys.detail(id), context?.detail)
      toast.error('Could not update this order. Please try again.')
    },
    // Filters and dashboard counts may depend on the new status
    onSettled: () => queryClient.invalidateQueries({ queryKey: adminOrderKeys.all }),
  })
}
