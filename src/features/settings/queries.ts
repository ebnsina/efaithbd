import { queryOptions } from '@tanstack/react-query'
import { getSiteSettings } from './settings.functions'

export const siteSettingsQuery = queryOptions({
  queryKey: ['site-settings'],
  queryFn: () => getSiteSettings(),
})
