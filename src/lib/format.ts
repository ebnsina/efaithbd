import { useSuspenseQuery } from '@tanstack/react-query'
import { siteSettingsQuery } from '@/features/settings/queries'

const number = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 })
const date = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

// Currency symbol comes from site settings; the root loader has already cached them
export function useMoney() {
  const { data: settings } = useSuspenseQuery(siteSettingsQuery)
  const symbol = settings?.currencySymbol ?? ''
  return (amount: number) => `${symbol}${number.format(amount)}`
}

export const formatNumber = (value: number) => number.format(value)
export const formatDate = (value: Date | string) => date.format(new Date(value))
