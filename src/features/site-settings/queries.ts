import { type QueryKey, queryOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getBasicSettings, getFooter, getMenu } from './settings.functions'

export const settingsKeys = {
  all: ['admin', 'site-settings'] as const,
  basic: () => [...settingsKeys.all, 'basic'] as const,
  footer: () => [...settingsKeys.all, 'footer'] as const,
  menu: () => [...settingsKeys.all, 'menu'] as const,
}

export const basicSettingsQuery = () =>
  queryOptions({
    queryKey: settingsKeys.basic(),
    queryFn: () => getBasicSettings(),
  })
export const footerQuery = () => queryOptions({ queryKey: settingsKeys.footer(), queryFn: () => getFooter() })
export const menuQuery = () => queryOptions({ queryKey: settingsKeys.menu(), queryFn: () => getMenu() })

export type Footer = Awaited<ReturnType<typeof getFooter>>
export type Menu = Awaited<ReturnType<typeof getMenu>>

// Saves that may be refused with { ok: false, error } still count as failures for the toast
export function useSave<I, R>(
  save: (values: I) => Promise<R>,
  { invalidate, success, failure }: { invalidate: QueryKey[]; success: string; failure: string }
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: save,
    onSuccess: async (result) => {
      const refused = result && typeof result === 'object' && 'ok' in result && result.ok === false
      if (refused) return toast.error((result as { error?: string }).error ?? failure)
      toast.success(success)
      await Promise.all(invalidate.map((queryKey) => queryClient.invalidateQueries({ queryKey })))
    },
    onError: () => toast.error(failure),
  })
}
