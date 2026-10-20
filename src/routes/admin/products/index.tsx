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
import type { listAdminProducts } from '@/features/products/admin-products.functions'
import { adminProductListQuery, useDeleteProduct } from '@/features/products/admin-queries'
import { adminProductSearchSchema } from '@/features/products/schemas'
import { useMoney } from '@/lib/format'
import { listSearchDefaults } from '@/lib/list-search'

export const Route = createFileRoute('/admin/products/')({
  validateSearch: adminProductSearchSchema,
  search: { middlewares: [stripSearchParams(listSearchDefaults)] },
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) => context.queryClient.ensureQueryData(adminProductListQuery(deps)),
  head: () => ({ meta: [{ title: 'Products' }] }),
  component: ProductsPage,
})

type Product = Awaited<ReturnType<typeof listAdminProducts>>['rows'][number]

function ProductsPage() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const money = useMoney()
  const products = useQuery(adminProductListQuery(search))
  const deleteProduct = useDeleteProduct()
  const [deleting, setDeleting] = useState<Product | null>(null)

  const columns: DataColumn<Product>[] = [
    {
      id: 'image',
      header: 'Image',
      enableSorting: false,
      cell: ({ row }) =>
        row.original.images[0] ? (
          <img src={row.original.images[0]} alt="" loading="lazy" className="size-12 rounded-md object-cover" />
        ) : (
          <div className="size-12 rounded-md bg-muted" />
        ),
    },
    {
      id: 'name',
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.name}</div>
          <div className="text-muted-foreground text-xs">{row.original.slug}</div>
        </div>
      ),
    },
    { id: 'category', header: 'Category', enableSorting: false, cell: ({ row }) => row.original.category.name },
    { id: 'price', accessorKey: 'price', header: 'Price', cell: ({ row }) => money(row.original.price) },
    {
      id: 'stock',
      accessorKey: 'stock',
      header: 'Stock',
      cell: ({ row }) =>
        row.original._count.variants > 0 ? (
          <span className="text-muted-foreground text-xs">{row.original._count.variants} variants</span>
        ) : (
          row.original.stock
        ),
    },
    {
      id: 'status',
      header: 'Status',
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          <Badge variant={row.original.active ? 'default' : 'secondary'}>
            {row.original.active ? 'Active' : 'Inactive'}
          </Badge>
          {row.original.featured && <Badge variant="outline">Featured</Badge>}
        </div>
      ),
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
            <DropdownMenuItem render={<Link to="/admin/products/$id" params={{ id: row.original.id }} />}>
              <HugeiconsIcon icon={PencilEdit02Icon} />
              Edit
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
        title="Products"
        description="Create and manage your products"
        action={
          <Link to="/admin/products/$id" params={{ id: 'new' }} className={buttonVariants()}>
            <HugeiconsIcon icon={Add01Icon} />
            Add product
          </Link>
        }
      />
      <DataTable
        columns={columns}
        data={products.data}
        search={search}
        onSearchChange={(changes) => navigate({ search: (prev) => ({ ...prev, ...changes }), replace: true })}
        isPending={products.isPending}
        isError={products.isError}
        isFetching={products.isFetching}
        getRowId={(product) => product.id}
        searchPlaceholder="Search by name, slug or category"
        emptyMessage="No products found"
        filters={[
          {
            name: 'status',
            label: 'Status',
            options: [
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
              { value: 'featured', label: 'Featured' },
            ],
          },
        ]}
      />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete this product?"
        description={`“${deleting?.name}” will be removed from your store. This can't be undone.`}
        pending={deleteProduct.isPending}
        onConfirm={() => deleting && deleteProduct.mutate(deleting.id, { onSettled: () => setDeleting(null) })}
      />
    </>
  )
}
