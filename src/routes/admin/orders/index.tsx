import { Add01Icon, Delete02Icon, MoreVerticalIcon, ViewIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link, stripSearchParams } from '@tanstack/react-router'
import { useState } from 'react'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type DataColumn, DataTable } from '@/components/data-table'
import { PageHeader } from '@/components/page-header'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { listAdminOrders } from '@/features/admin-orders/admin-orders.functions'
import { deleteOrderText, OrderSheet } from '@/features/admin-orders/order-sheet'
import { adminOrderListQuery, useDeleteOrder } from '@/features/admin-orders/queries'
import { adminOrderRouteSchema } from '@/features/admin-orders/schemas'
import {
  orderStatusBadge,
  orderStatusLabels,
  paymentMethodLabels,
  paymentStatusBadge,
  paymentStatusLabels,
  toOptions,
} from '@/features/admin-orders/status'
import { formatDate, useMoney } from '@/lib/format'
import { listSearchDefaults } from '@/lib/list-search'

export const Route = createFileRoute('/admin/orders/')({
  validateSearch: adminOrderRouteSchema,
  search: { middlewares: [stripSearchParams(listSearchDefaults)] },
  loaderDeps: ({ search: { order: _, ...search } }) => search,
  loader: ({ context, deps }) => context.queryClient.ensureQueryData(adminOrderListQuery(deps)),
  head: () => ({ meta: [{ title: 'Orders' }] }),
  component: OrdersPage,
})

type Order = Awaited<ReturnType<typeof listAdminOrders>>['rows'][number]

function OrdersPage() {
  const { order: openOrderId, ...search } = Route.useSearch()
  const navigate = Route.useNavigate()
  const money = useMoney()
  const orders = useQuery(adminOrderListQuery(search))
  const openOrder = (order?: string) => navigate({ search: (prev) => ({ ...prev, order }) })
  const [deleting, setDeleting] = useState<Order | null>(null)
  const deleteOrder = useDeleteOrder()

  const columns: DataColumn<Order>[] = [
    {
      id: 'orderNumber',
      accessorKey: 'orderNumber',
      header: 'Order',
      cell: ({ row }) => (
        <button
          type="button"
          onClick={() => openOrder(row.original.id)}
          className="font-medium underline-offset-4 hover:underline"
        >
          {row.original.orderNumber}
        </button>
      ),
    },
    {
      id: 'customerName',
      accessorKey: 'customerName',
      header: 'Customer',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.customerName}</div>
          <div className="text-muted-foreground text-xs">{row.original.customerPhone}</div>
        </div>
      ),
    },
    {
      id: 'total',
      accessorKey: 'total',
      header: 'Total',
      cell: ({ row }) => <span className="tabular-nums">{money(row.original.total)}</span>,
    },
    {
      id: 'orderStatus',
      header: 'Status',
      enableSorting: false,
      cell: ({ row }) => (
        <Badge variant={orderStatusBadge[row.original.orderStatus]}>{orderStatusLabels[row.original.orderStatus]}</Badge>
      ),
    },
    {
      id: 'payment',
      header: 'Payment',
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex flex-col items-start gap-1">
          <Badge variant={paymentStatusBadge[row.original.paymentStatus]}>
            {paymentStatusLabels[row.original.paymentStatus]}
          </Badge>
          <span className="text-muted-foreground text-xs">{paymentMethodLabels[row.original.paymentMethod]}</span>
        </div>
      ),
    },
    {
      id: 'createdAt',
      accessorKey: 'createdAt',
      header: 'Date',
      cell: ({ row }) => <span className="text-muted-foreground">{formatDate(row.original.createdAt)}</span>,
    },
    {
      id: 'actions',
      header: '',
      enableSorting: false,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" size="icon-sm" aria-label={`Actions for ${row.original.orderNumber}`} />}
          >
            <HugeiconsIcon icon={MoreVerticalIcon} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => openOrder(row.original.id)}>
              <HugeiconsIcon icon={ViewIcon} />
              View
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={() => setDeleting(row.original)}>
              <HugeiconsIcon icon={Delete02Icon} />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="Orders"
        description="See every order and keep its status up to date"
        action={
          <Link to="/admin/orders/new" className={buttonVariants()}>
            <HugeiconsIcon icon={Add01Icon} />
            New order
          </Link>
        }
      />
      <DataTable
        columns={columns}
        data={orders.data}
        search={search}
        onSearchChange={(changes) =>
          navigate({
            search: (prev) => ({ ...prev, ...changes }),
            replace: true,
          })
        }
        isPending={orders.isPending}
        isError={orders.isError}
        isFetching={orders.isFetching}
        getRowId={(order) => order.id}
        searchPlaceholder="Search by order number, name or phone"
        emptyMessage={
          search.q || search.orderStatus || search.paymentStatus || search.paymentMethod
            ? 'No orders match your search'
            : 'No orders yet'
        }
        filters={[
          {
            name: 'orderStatus',
            label: 'Statuses',
            options: toOptions(orderStatusLabels),
          },
          {
            name: 'paymentStatus',
            label: 'Payments',
            options: toOptions(paymentStatusLabels),
          },
          {
            name: 'paymentMethod',
            label: 'Payment methods',
            options: toOptions(paymentMethodLabels),
          },
        ]}
      />
      <OrderSheet orderId={openOrderId} onClose={() => openOrder(undefined)} />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete this order?"
        description={deleting ? deleteOrderText(deleting) : ''}
        pending={deleteOrder.isPending}
        onConfirm={() =>
          deleting &&
          deleteOrder.mutate(deleting.id, {
            onSuccess: (result) => result.ok && deleting.id === openOrderId && openOrder(undefined),
            onSettled: () => setDeleting(null),
          })
        }
      />
    </>
  )
}
