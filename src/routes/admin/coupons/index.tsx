import { Add01Icon, Copy01Icon, Delete02Icon, MoreVerticalIcon, PencilEdit02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, stripSearchParams } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type DataColumn, DataTable } from '@/components/data-table'
import { PageHeader } from '@/components/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { type Coupon, CouponDialog } from '@/features/coupons/coupon-dialog'
import { couponListQuery, useDeleteCoupon } from '@/features/coupons/queries'
import { couponListSchema } from '@/features/coupons/schemas'
import { formatDate, formatNumber, useMoney } from '@/lib/format'
import { listSearchDefaults } from '@/lib/list-search'

export const Route = createFileRoute('/admin/coupons/')({
  validateSearch: couponListSchema,
  search: { middlewares: [stripSearchParams(listSearchDefaults)] },
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) => context.queryClient.ensureQueryData(couponListQuery(deps)),
  head: () => ({ meta: [{ title: 'Coupons' }] }),
  component: CouponsPage,
})

function CouponsPage() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const money = useMoney()
  const coupons = useQuery(couponListQuery(search))
  const deleteCoupon = useDeleteCoupon()
  const [editing, setEditing] = useState<Coupon | 'new' | null>(null)
  const [deleting, setDeleting] = useState<Coupon | null>(null)

  const copy = (code: string) =>
    navigator.clipboard.writeText(code).then(
      () => toast.success(`Copied ${code}`),
      () => toast.error('Could not copy the code'),
    )

  const columns: DataColumn<Coupon>[] = [
    {
      id: 'code',
      accessorKey: 'code',
      header: 'Code',
      cell: ({ row }) => (
        <div>
          <button
            type="button"
            onClick={() => copy(row.original.code)}
            className="inline-flex items-center gap-1.5 font-medium font-mono hover:text-primary"
            aria-label={`Copy ${row.original.code}`}
          >
            {row.original.code}
            <HugeiconsIcon icon={Copy01Icon} className="size-3.5 text-muted-foreground" />
          </button>
          {row.original.description && (
            <div className="max-w-56 truncate text-muted-foreground text-xs">{row.original.description}</div>
          )}
        </div>
      ),
    },
    {
      id: 'value',
      accessorKey: 'value',
      header: 'Discount',
      cell: ({ row }) => {
        const c = row.original
        return (
          <div>
            <div className="tabular-nums">{c.type === 'PERCENTAGE' ? `${formatNumber(c.value)}%` : money(c.value)}</div>
            <div className="text-muted-foreground text-xs">
              {[c.minPurchase && `Min. order ${money(c.minPurchase)}`, c.maxDiscount && `Up to ${money(c.maxDiscount)}`]
                .filter(Boolean)
                .join(' · ')}
            </div>
          </div>
        )
      },
    },
    {
      id: 'usageCount',
      accessorKey: 'usageCount',
      header: 'Used',
      cell: ({ row }) => (
        <span className="tabular-nums">
          {formatNumber(row.original.usageCount)}
          {row.original.usageLimit !== null && ` of ${formatNumber(row.original.usageLimit)}`}
        </span>
      ),
    },
    {
      id: 'validTo',
      accessorKey: 'validTo',
      header: 'Valid',
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-muted-foreground">
          {formatDate(row.original.validFrom)} – {formatDate(row.original.validTo)}
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      enableSorting: false,
      cell: ({ row }) => {
        const c = row.original
        const usedUp = c.usageLimit !== null && c.usageCount >= c.usageLimit
        const [label, variant] = !c.active
          ? (['Paused', 'secondary'] as const)
          : new Date(c.validTo) < new Date()
            ? (['Expired', 'destructive'] as const)
            : new Date(c.validFrom) > new Date()
              ? (['Scheduled', 'outline'] as const)
              : usedUp
                ? (['Used up', 'secondary'] as const)
                : (['Active', 'default'] as const)
        return <Badge variant={variant}>{label}</Badge>
      },
    },
    {
      id: 'actions',
      header: '',
      enableSorting: false,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" size="icon-sm" aria-label={`Actions for ${row.original.code}`} />}
          >
            <HugeiconsIcon icon={MoreVerticalIcon} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setEditing(row.original)}>
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
        title="Coupons"
        description="Discount codes customers can use at checkout"
        action={
          <Button onClick={() => setEditing('new')}>
            <HugeiconsIcon icon={Add01Icon} />
            Add coupon
          </Button>
        }
      />
      <DataTable
        columns={columns}
        data={coupons.data}
        search={search}
        onSearchChange={(changes) =>
          navigate({
            search: (prev) => ({ ...prev, ...changes }),
            replace: true,
          })
        }
        isPending={coupons.isPending}
        isError={coupons.isError}
        isFetching={coupons.isFetching}
        getRowId={(coupon) => coupon.id}
        searchPlaceholder="Search by code or description"
        emptyMessage={search.q || search.status ? 'No coupons match your search' : 'No coupons yet'}
        filters={[
          {
            name: 'status',
            label: 'Coupons',
            options: [
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Paused' },
              { value: 'expired', label: 'Expired' },
            ],
          },
        ]}
      />
      <CouponDialog coupon={editing} onClose={() => setEditing(null)} />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete this coupon?"
        description={`“${deleting?.code}” will stop working at checkout. Past orders keep their discount. This can't be undone.`}
        pending={deleteCoupon.isPending}
        onConfirm={() =>
          deleting &&
          deleteCoupon.mutate(deleting.id, {
            onSettled: () => setDeleting(null),
          })
        }
      />
    </>
  )
}
