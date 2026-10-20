import { type QueryKey, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Switch } from '@/components/ui/switch'
import { type ContentTable, deleteRow, reorderRows, setRowActive } from './rows.functions'

export const sortByIds = <T extends { id: string }>(rows: T[], ids: string[]) =>
  ids.flatMap((id) => rows.filter((row) => row.id === id))

// Optimistic: the list moves at once and snaps back if saving fails
export function useReorderRows<D>(table: ContentTable, queryKey: QueryKey, apply: (data: D, ids: string[]) => D) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (ids: string[]) => reorderRows({ data: { table, ids } }),
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<D>(queryKey)
      if (previous) queryClient.setQueryData(queryKey, apply(previous, ids))
      return { previous }
    },
    onSuccess: () => toast.success('New order saved'),
    onError: (_error, _ids, context) => {
      queryClient.setQueryData(queryKey, context?.previous)
      toast.error('Could not save the new order. Please try again.')
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  })
}

export function useDeleteRow(table: ContentTable, queryKey: QueryKey, noun: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteRow({ data: { table, id } }),
    onSuccess: () => {
      toast.success(`${noun} deleted`)
      return queryClient.invalidateQueries({ queryKey })
    },
    onError: () => toast.error(`Could not delete this ${noun.toLowerCase()}. Please try again.`),
  })
}

export function ActiveSwitch({
  table,
  id,
  active,
  queryKey,
  label,
}: {
  table: ContentTable
  id: string
  active: boolean
  queryKey: QueryKey
  label: string
}) {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (next: boolean) => setRowActive({ data: { table, id, active: next } }),
    onSuccess: (_result, next) => {
      toast.success(next ? `${label} is now shown` : `${label} is now hidden`)
      return queryClient.invalidateQueries({ queryKey })
    },
    onError: () => toast.error('Could not change this. Please try again.'),
  })
  return (
    <Switch
      checked={mutation.isPending ? mutation.variables : active}
      disabled={mutation.isPending}
      onCheckedChange={(next) => mutation.mutate(next)}
      aria-label={`Show ${label}`}
    />
  )
}
