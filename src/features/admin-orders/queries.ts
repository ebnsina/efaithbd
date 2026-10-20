import { keepPreviousData, queryOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { ListResult } from '@/lib/list-search'
import {
  createAdminOrder,
  deleteOrder,
  getAdminOrder,
  listAdminOrders,
  searchOrderCustomers,
  searchOrderProducts,
  updateOrder,
  updateOrderDetails,
} from './admin-orders.functions'
import type { AdminOrderSearch, NewOrderValues, UpdateOrderInput } from './schemas'

const adminOrderKeys = {
  all: ['admin', 'orders'] as const,
  lists: ['admin', 'orders', 'list'] as const,
  list: (search: AdminOrderSearch) => [...adminOrderKeys.lists, search] as const,
  detail: (id: string) => [...adminOrderKeys.all, 'detail', id] as const,
  customers: (q: string) => [...adminOrderKeys.all, 'customers', q] as const,
  products: (q: string) => [...adminOrderKeys.all, 'products', q] as const,
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

export const orderCustomersQuery = (q: string) =>
  queryOptions({
    queryKey: adminOrderKeys.customers(q),
    queryFn: () => searchOrderCustomers({ data: { q } }),
    placeholderData: keepPreviousData,
  })

export const orderProductsQuery = (q: string) =>
  queryOptions({
    queryKey: adminOrderKeys.products(q),
    queryFn: () => searchOrderProducts({ data: { q } }),
    placeholderData: keepPreviousData,
    staleTime: 0,
  })

type OrderRow = Awaited<ReturnType<typeof listAdminOrders>>['rows'][number]
type OrderDetail = Awaited<ReturnType<typeof getAdminOrder>>

class UpdateProblem extends Error {}
const genericError = 'Could not update this order. Please try again.'

// Stock and coupon counts move with orders, so their admin lists go stale too
function useInvalidateAfterOrderChange() {
  const queryClient = useQueryClient()
  return () =>
    Promise.all(
      [adminOrderKeys.all, ['admin', 'products'], ['admin', 'coupons']].map((queryKey) =>
        queryClient.invalidateQueries({ queryKey }),
      ),
    )
}

export function useUpdateOrder() {
  const queryClient = useQueryClient()
  const invalidate = useInvalidateAfterOrderChange()
  return useMutation({
    mutationFn: async (input: UpdateOrderInput) => {
      const result = await updateOrder({ data: input })
      if (!result.ok) throw new UpdateProblem(result.error)
    },
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
    onSuccess: (_result, { orderStatus }) =>
      toast.success(orderStatus === 'CANCELLED' ? 'Order cancelled. Its items are back in stock.' : 'Order updated'),
    onError: (error, { id }, context) => {
      for (const [key, data] of context?.lists ?? []) queryClient.setQueryData(key, data)
      queryClient.setQueryData(adminOrderKeys.detail(id), context?.detail)
      toast.error(error instanceof UpdateProblem ? error.message : genericError)
    },
    onSettled: invalidate,
  })
}

export function useUpdateOrderDetails() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateOrderDetails,
    onSuccess: (result) => {
      if (!result.ok) return toast.error(result.error)
      toast.success('Changes saved')
      return queryClient.invalidateQueries({ queryKey: adminOrderKeys.all })
    },
    onError: () => toast.error('Could not save these changes. Please try again.'),
  })
}

export function useDeleteOrder() {
  const invalidate = useInvalidateAfterOrderChange()
  return useMutation({
    mutationFn: (id: string) => deleteOrder({ data: { id } }),
    onSuccess: (result) => {
      if (!result.ok) return toast.error(result.error)
      toast.success('Order deleted. Its items are back in stock.')
      return invalidate()
    },
    onError: () => toast.error('Could not delete this order. Please try again.'),
  })
}

export function useCreateOrder() {
  const invalidate = useInvalidateAfterOrderChange()
  return useMutation({
    mutationFn: (values: NewOrderValues) => createAdminOrder({ data: values }),
    onSuccess: (result) => {
      if (!result.ok) return
      toast.success('Order created')
      return invalidate()
    },
    onError: () => toast.error('Could not create this order. Please try again.'),
  })
}
