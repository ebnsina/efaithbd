import { queryOptions } from '@tanstack/react-query'
import { getShopLayout } from './shop-layout.functions'

export const shopLayoutQuery = queryOptions({ queryKey: ['shop-layout'], queryFn: () => getShopLayout() })
