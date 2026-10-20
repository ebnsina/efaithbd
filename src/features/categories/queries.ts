import { keepPreviousData, queryOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  createCategory,
  deleteCategory,
  getAdminCategory,
  listAdminCategories,
  listCategoryOptions,
  updateCategory,
} from './categories.functions'
import type { CategoryFormValues, CategorySearch } from './schemas'

export const adminCategoryKeys = {
  all: ['admin', 'categories'] as const,
  list: (search: CategorySearch) => [...adminCategoryKeys.all, 'list', search] as const,
  options: () => [...adminCategoryKeys.all, 'options'] as const,
  detail: (id: string) => [...adminCategoryKeys.all, 'detail', id] as const,
}

export const adminCategoryListQuery = (search: CategorySearch) =>
  queryOptions({
    queryKey: adminCategoryKeys.list(search),
    queryFn: () => listAdminCategories({ data: search }),
    placeholderData: keepPreviousData,
  })

export const categoryOptionsQuery = queryOptions({
  queryKey: adminCategoryKeys.options(),
  queryFn: () => listCategoryOptions(),
})

export const adminCategoryQuery = (id: string) =>
  queryOptions({
    queryKey: adminCategoryKeys.detail(id),
    queryFn: () => getAdminCategory({ data: { id } }),
  })

export function useSaveCategory(id: string | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: CategoryFormValues) =>
      id ? updateCategory({ data: { id, values } }) : createCategory({ data: values }),
    onSuccess: (result) => {
      if (!result.ok) return
      toast.success(id ? 'Changes saved' : 'Category created')
      // Product rows show the category name; the products feature imports these keys, so its prefix is spelled out
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
      return queryClient.invalidateQueries({ queryKey: adminCategoryKeys.all })
    },
    onError: () => toast.error('Could not save this category. Please try again.'),
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteCategory({ data: { id } }),
    onSuccess: (result) => {
      if (!result.ok) return toast.error(result.error)
      toast.success('Category deleted')
      return queryClient.invalidateQueries({ queryKey: adminCategoryKeys.all })
    },
    onError: () => toast.error('Could not delete this category. Please try again.'),
  })
}
