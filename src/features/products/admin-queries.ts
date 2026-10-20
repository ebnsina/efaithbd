import { keepPreviousData, queryOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { adminCategoryKeys } from '@/features/categories/queries'
import { createProduct, deleteProduct, getAdminProduct, listAdminProducts, updateProduct } from './admin-products.functions'
import type { AdminProductSearch, ProductFormValues } from './schemas'

export const adminProductKeys = {
  all: ['admin', 'products'] as const,
  list: (search: AdminProductSearch) => [...adminProductKeys.all, 'list', search] as const,
  detail: (id: string) => [...adminProductKeys.all, 'detail', id] as const,
}

export const adminProductListQuery = (search: AdminProductSearch) =>
  queryOptions({
    queryKey: adminProductKeys.list(search),
    queryFn: () => listAdminProducts({ data: search }),
    placeholderData: keepPreviousData,
  })

export const adminProductQuery = (id: string) =>
  queryOptions({
    queryKey: adminProductKeys.detail(id),
    queryFn: () => getAdminProduct({ data: { id } }),
  })

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteProduct({ data: { id } }),
    onSuccess: (result) => {
      if (!result.ok) return toast.error(result.error)
      toast.success('Product deleted')
      queryClient.invalidateQueries({ queryKey: adminCategoryKeys.all })
      return queryClient.invalidateQueries({ queryKey: adminProductKeys.all })
    },
    onError: () => toast.error('Could not delete this product. Please try again.'),
  })
}

export function useSaveProduct(id: string | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: ProductFormValues) =>
      id ? updateProduct({ data: { id, values } }) : createProduct({ data: values }),
    onSuccess: (result) => {
      if (!result.ok) return
      toast.success(id ? 'Changes saved' : 'Product created')
      queryClient.invalidateQueries({ queryKey: adminCategoryKeys.all })
      return queryClient.invalidateQueries({ queryKey: adminProductKeys.all })
    },
    onError: () => toast.error('Could not save this product. Please try again.'),
  })
}
