import { Add01Icon, Delete02Icon, MoreVerticalIcon, PencilEdit02Icon } from '@hugeicons/core-free-icons'
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
import type { listAdminCustomers } from '@/features/customers/customers.functions'
import { adminCustomerListQuery, useDeleteCustomer } from '@/features/customers/queries'
import { adminCustomerSearchSchema, roleLabels } from '@/features/customers/schemas'
import { formatDate, formatNumber } from '@/lib/format'
import { listSearchDefaults } from '@/lib/list-search'

export const Route = createFileRoute('/admin/customers/')({
  validateSearch: adminCustomerSearchSchema,
  search: { middlewares: [stripSearchParams(listSearchDefaults)] },
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) => context.queryClient.ensureQueryData(adminCustomerListQuery(deps)),
  head: () => ({ meta: [{ title: 'Customers' }] }),
  component: CustomersPage,
})

type Customer = Awaited<ReturnType<typeof listAdminCustomers>>['rows'][number]

const deleteMessage = (customer: Customer | null) => {
  if (!customer) return ''
  const orders = customer._count.orders
  const kept =
    orders === 0
      ? 'They have no orders.'
      : `Their ${formatNumber(orders)} ${orders === 1 ? 'order' : 'orders'} will be kept without an account.`
  return `“${customer.name}” will no longer be able to sign in. ${kept} Their reviews and questions stay too. This can't be undone.`
}

function CustomersPage() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const customers = useQuery(adminCustomerListQuery(search))
  const deleteCustomer = useDeleteCustomer()
  const [deleting, setDeleting] = useState<Customer | null>(null)

  const columns: DataColumn<Customer>[] = [
    {
      id: 'name',
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <Link
          to="/admin/customers/$id"
          params={{ id: row.original.id }}
          className="font-medium underline-offset-4 hover:underline"
        >
          {row.original.name}
        </Link>
      ),
    },
    { id: 'email', header: 'Email', enableSorting: false, cell: ({ row }) => row.original.email },
    {
      id: 'phone',
      header: 'Phone',
      enableSorting: false,
      cell: ({ row }) => row.original.phone ?? <span className="text-muted-foreground">Not given</span>,
    },
    {
      id: 'role',
      header: 'Role',
      enableSorting: false,
      cell: ({ row }) => (
        <Badge variant={row.original.role === 'ADMIN' ? 'default' : 'secondary'}>{roleLabels[row.original.role]}</Badge>
      ),
    },
    {
      id: 'orders',
      header: 'Orders',
      accessorFn: (customer) => customer._count.orders,
      cell: ({ row }) => formatNumber(row.original._count.orders),
    },
    {
      id: 'createdAt',
      accessorKey: 'createdAt',
      header: 'Joined',
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      id: 'actions',
      header: '',
      enableSorting: false,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" size="icon-sm" aria-label={`Actions for ${row.original.name}`} />}
          >
            <HugeiconsIcon icon={MoreVerticalIcon} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem render={<Link to="/admin/customers/$id" params={{ id: row.original.id }} />}>
              <HugeiconsIcon icon={PencilEdit02Icon} />
              View and edit
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
        title="Customers"
        description="Everyone with an account in your store"
        action={
          <Link to="/admin/customers/$id" params={{ id: 'new' }} className={buttonVariants()}>
            <HugeiconsIcon icon={Add01Icon} />
            Add customer
          </Link>
        }
      />
      <DataTable
        columns={columns}
        data={customers.data}
        search={search}
        onSearchChange={(changes) => navigate({ search: (prev) => ({ ...prev, ...changes }), replace: true })}
        isPending={customers.isPending}
        isError={customers.isError}
        isFetching={customers.isFetching}
        getRowId={(customer) => customer.id}
        searchPlaceholder="Search by name, email or phone"
        emptyMessage="No customers found"
        filters={[
          {
            name: 'role',
            label: 'Roles',
            options: [
              { value: 'CUSTOMER', label: 'Customers' },
              { value: 'ADMIN', label: 'Admins' },
            ],
          },
        ]}
      />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete this account?"
        description={deleteMessage(deleting)}
        pending={deleteCustomer.isPending}
        onConfirm={() => deleting && deleteCustomer.mutate(deleting.id, { onSettled: () => setDeleting(null) })}
      />
    </>
  )
}
