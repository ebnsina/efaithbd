import { keepPreviousData, queryOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createCustomer, deleteCustomer, getAdminCustomer, listAdminCustomers, updateCustomer } from './customers.functions'
import type { AdminCustomerSearch, CustomerFormValues } from './schemas'

export const adminCustomerKeys = {
  all: ['admin', 'customers'] as const,
  list: (search: AdminCustomerSearch) => [...adminCustomerKeys.all, 'list', search] as const,
  detail: (id: string) => [...adminCustomerKeys.all, 'detail', id] as const,
}

export const adminCustomerListQuery = (search: AdminCustomerSearch) =>
  queryOptions({
    queryKey: adminCustomerKeys.list(search),
    queryFn: () => listAdminCustomers({ data: search }),
    placeholderData: keepPreviousData,
  })

export const adminCustomerQuery = (id: string) =>
  queryOptions({
    queryKey: adminCustomerKeys.detail(id),
    queryFn: () => getAdminCustomer({ data: { id } }),
  })

export function useDeleteCustomer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteCustomer({ data: { id } }),
    onSuccess: (result) => {
      if (!result.ok) return toast.error(result.error)
      toast.success('Account deleted')
      return queryClient.invalidateQueries({ queryKey: adminCustomerKeys.all })
    },
    onError: () => toast.error('Could not delete this account. Please try again.'),
  })
}

export function useSaveCustomer(id: string | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: CustomerFormValues) =>
      id ? updateCustomer({ data: { id, values } }) : createCustomer({ data: values }),
    onSuccess: (result) => {
      if (!result.ok) return
      toast.success(id ? 'Changes saved' : 'Account created')
      return queryClient.invalidateQueries({ queryKey: adminCustomerKeys.all })
    },
    onError: () => toast.error('Could not save this account. Please try again.'),
  })
}
