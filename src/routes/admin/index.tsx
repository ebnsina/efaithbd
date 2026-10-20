import {
  ArrowRight01Icon,
  Clock01Icon,
  MoneyReceive02Icon,
  PackageIcon,
  ShoppingBag01Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { PageHeader } from '@/components/page-header'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { orderStatusBadge, orderStatusLabels } from '@/features/admin-orders/status'
import { dashboardQuery } from '@/features/dashboard/queries'
import { formatDate, formatNumber, useMoney } from '@/lib/format'

export const Route = createFileRoute('/admin/')({
  loader: ({ context }) => context.queryClient.ensureQueryData(dashboardQuery),
  head: () => ({ meta: [{ title: 'Dashboard' }] }),
  component: Dashboard,
})

function Dashboard() {
  const money = useMoney()
  const { data, isPending, isError, refetch, isRefetching } = useQuery(dashboardQuery)

  if (isError) {
    return (
      <>
        <PageHeader title="Dashboard" description="How your store is doing" />
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <p className="text-muted-foreground">Could not load your store numbers.</p>
            <Button variant="outline" onClick={() => refetch()} disabled={isRefetching}>
              Try again
            </Button>
          </CardContent>
        </Card>
      </>
    )
  }

  const stats = data && [
    {
      title: 'Products',
      value: formatNumber(data.totalProducts),
      note: `${formatNumber(data.activeProducts)} on sale`,
      icon: PackageIcon,
    },
    {
      title: 'Orders',
      value: formatNumber(data.totalOrders),
      note: `${formatNumber(data.todayOrders)} today`,
      icon: ShoppingBag01Icon,
    },
    {
      title: 'Waiting for you',
      value: formatNumber(data.pendingOrders),
      note: 'Pending orders',
      icon: Clock01Icon,
    },
    {
      title: 'Revenue',
      value: money(data.revenue),
      note: 'From paid orders',
      icon: MoneyReceive02Icon,
    },
  ]

  return (
    <>
      <PageHeader title="Dashboard" description="How your store is doing" />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {stats
          ? stats.map((stat) => (
              <Card key={stat.title}>
                <CardHeader>
                  <CardDescription>{stat.title}</CardDescription>
                  <CardTitle className="font-semibold text-2xl tabular-nums">{stat.value}</CardTitle>
                  <CardAction>
                    <div className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <HugeiconsIcon icon={stat.icon} className="size-5" />
                    </div>
                  </CardAction>
                </CardHeader>
                <CardContent className="text-muted-foreground text-xs">{stat.note}</CardContent>
              </Card>
            ))
          : ['a', 'b', 'c', 'd'].map((key) => <Skeleton key={key} className="h-32 rounded-xl" />)}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Latest orders</CardTitle>
          <CardDescription>The 10 most recent orders</CardDescription>
          <CardAction>
            <Link to="/admin/orders" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
              All orders
              <HugeiconsIcon icon={ArrowRight01Icon} />
            </Link>
          </CardAction>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {isPending ? (
            <div className="space-y-2">
              {['a', 'b', 'c', 'd', 'e'].map((key) => (
                <Skeleton key={key} className="h-10" />
              ))}
            </div>
          ) : data.recentOrders.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">No orders yet. New orders will show up here.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <Link
                        to="/admin/orders"
                        search={{ order: order.id }}
                        className="font-medium underline-offset-4 hover:underline"
                      >
                        {order.orderNumber}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{order.customerName}</div>
                      <div className="text-muted-foreground text-xs">{order.customerPhone}</div>
                    </TableCell>
                    <TableCell className="tabular-nums">{formatNumber(order._count.items)}</TableCell>
                    <TableCell className="tabular-nums">{money(order.total)}</TableCell>
                    <TableCell>
                      <Badge variant={orderStatusBadge[order.orderStatus]}>{orderStatusLabels[order.orderStatus]}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(order.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  )
}
