import { keepPreviousData, queryOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { deleteProduct, listAdminProducts } from './admin-products.functions'
import type { AdminProductSearch } from './schemas'

export const adminProductKeys = {
  all: ['admin', 'products'] as const,
  list: (search: AdminProductSearch) => [...adminProductKeys.all, 'list', search] as const,
}

export const adminProductListQuery = (search: AdminProductSearch) =>
  queryOptions({
    queryKey: adminProductKeys.list(search),
    queryFn: () => listAdminProducts({ data: search }),
    placeholderData: keepPreviousData,
  })

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteProduct({ data: { id } }),
    onSuccess: () => {
      toast.success('Product deleted')
      return queryClient.invalidateQueries({ queryKey: adminProductKeys.all })
    },
    onError: () => toast.error('Could not delete this product. Please try again.'),
  })
}
