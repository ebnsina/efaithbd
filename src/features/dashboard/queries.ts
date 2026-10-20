import { queryOptions } from '@tanstack/react-query'
import { getDashboard } from './dashboard.functions'

// Under the orders key so order status changes refresh the dashboard too
export const dashboardQuery = queryOptions({
  queryKey: ['admin', 'orders', 'dashboard'],
  queryFn: () => getDashboard(),
})
