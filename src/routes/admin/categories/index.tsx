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
import type { listAdminCategories } from '@/features/categories/categories.functions'
import { adminCategoryListQuery, useDeleteCategory } from '@/features/categories/queries'
import { categorySearchSchema } from '@/features/categories/schemas'
import { formatDate, formatNumber } from '@/lib/format'
import { listSearchDefaults } from '@/lib/list-search'

export const Route = createFileRoute('/admin/categories/')({
  validateSearch: categorySearchSchema,
  search: { middlewares: [stripSearchParams(listSearchDefaults)] },
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) => context.queryClient.ensureQueryData(adminCategoryListQuery(deps)),
  head: () => ({ meta: [{ title: 'Categories' }] }),
  component: CategoriesPage,
})

type Category = Awaited<ReturnType<typeof listAdminCategories>>['rows'][number]

function CategoriesPage() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const categories = useQuery(adminCategoryListQuery(search))
  const deleteCategory = useDeleteCategory()
  const [deleting, setDeleting] = useState<Category | null>(null)

  const columns: DataColumn<Category>[] = [
    {
      id: 'image',
      header: 'Image',
      enableSorting: false,
      cell: ({ row }) =>
        row.original.image ? (
          <img src={row.original.image} alt="" loading="lazy" className="size-12 rounded-md object-cover" />
        ) : (
          <div className="size-12 rounded-md bg-muted" />
        ),
    },
    {
      id: 'name',
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div className="max-w-xs">
          <div className="font-medium">{row.original.name}</div>
          <div className="text-muted-foreground text-xs">{row.original.slug}</div>
        </div>
      ),
    },
    {
      id: 'subcategories',
      header: 'Subcategories',
      enableSorting: false,
      cell: ({ row }) => {
        const subs = row.original.subcategories
        if (subs.length === 0) return <span className="text-muted-foreground text-xs">None</span>
        return (
          <div className="flex max-w-xs flex-wrap gap-1">
            {subs.slice(0, 3).map((sub) => (
              <Badge key={sub.name} variant="outline">
                {sub.name}
              </Badge>
            ))}
            {subs.length > 3 && <Badge variant="secondary">+{subs.length - 3}</Badge>}
          </div>
        )
      },
    },
    {
      id: 'products',
      header: 'Products',
      enableSorting: false,
      cell: ({ row }) => formatNumber(row.original._count.products),
    },
    {
      id: 'createdAt',
      accessorKey: 'createdAt',
      header: 'Added',
      cell: ({ row }) => <span className="text-muted-foreground">{formatDate(row.original.createdAt)}</span>,
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
            <DropdownMenuItem render={<Link to="/admin/categories/$id" params={{ id: row.original.id }} />}>
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
        title="Categories"
        description="Group your products so customers can find them"
        action={
          <Link to="/admin/categories/$id" params={{ id: 'new' }} className={buttonVariants()}>
            <HugeiconsIcon icon={Add01Icon} />
            Add category
          </Link>
        }
      />
      <DataTable
        columns={columns}
        data={categories.data}
        search={search}
        onSearchChange={(changes) => navigate({ search: (prev) => ({ ...prev, ...changes }), replace: true })}
        isPending={categories.isPending}
        isError={categories.isError}
        isFetching={categories.isFetching}
        getRowId={(category) => category.id}
        searchPlaceholder="Search by name, web address or subcategory"
        emptyMessage={search.q ? 'No categories match your search' : 'No categories yet'}
      />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete this category?"
        description={`“${deleting?.name}” and its subcategories will be removed. This can't be undone.`}
        pending={deleteCategory.isPending}
        onConfirm={() => deleting && deleteCategory.mutate(deleting.id, { onSettled: () => setDeleting(null) })}
      />
    </>
  )
}
