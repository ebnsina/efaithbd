import {
  CheckmarkCircle02Icon,
  Delete02Icon,
  MoreVerticalIcon,
  StarIcon,
  ViewOffSlashIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, stripSearchParams } from '@tanstack/react-router'
import { useState } from 'react'
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
import type { listAdminReviews } from '@/features/admin-reviews/admin-reviews.functions'
import { adminReviewListQuery, useDeleteReview, useSetReviewApproval } from '@/features/admin-reviews/queries'
import { ratingFilters, reviewSearchSchema } from '@/features/admin-reviews/schemas'
import { formatDate, formatNumber } from '@/lib/format'
import { listSearchDefaults } from '@/lib/list-search'

export const Route = createFileRoute('/admin/reviews/')({
  validateSearch: reviewSearchSchema,
  search: { middlewares: [stripSearchParams(listSearchDefaults)] },
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) => context.queryClient.ensureQueryData(adminReviewListQuery(deps)),
  head: () => ({ meta: [{ title: 'Reviews' }] }),
  component: ReviewsPage,
})

type Review = Awaited<ReturnType<typeof listAdminReviews>>['rows'][number]

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex" role="img" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <HugeiconsIcon
          key={star}
          icon={StarIcon}
          className={star <= rating ? 'size-4 fill-current text-primary' : 'size-4 text-muted-foreground/40'}
        />
      ))}
    </div>
  )
}

function ReviewsPage() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const reviews = useQuery(adminReviewListQuery(search))
  const setApproval = useSetReviewApproval()
  const deleteReview = useDeleteReview()
  const [deleting, setDeleting] = useState<Review | null>(null)
  const pending = reviews.data?.pendingCount ?? 0

  const columns: DataColumn<Review>[] = [
    {
      id: 'review',
      header: 'Review',
      enableSorting: false,
      cell: ({ row }) => (
        <div className="min-w-56 max-w-md whitespace-normal">
          {row.original.title && <div className="font-medium">{row.original.title}</div>}
          <p className="line-clamp-3 text-muted-foreground text-sm">{row.original.comment}</p>
        </div>
      ),
    },
    {
      id: 'product',
      header: 'Product',
      enableSorting: false,
      cell: ({ row }) => (
        <a
          href={`/products/${row.original.product.slug}`}
          target="_blank"
          rel="noreferrer"
          className="block max-w-48 truncate hover:underline"
        >
          {row.original.product.name}
        </a>
      ),
    },
    {
      id: 'customer',
      header: 'Customer',
      enableSorting: false,
      cell: ({ row }) => (
        <div>
          <div>{row.original.user?.name ?? 'Guest'}</div>
          {row.original.verified && <div className="text-muted-foreground text-xs">Verified purchase</div>}
        </div>
      ),
    },
    {
      id: 'rating',
      accessorKey: 'rating',
      header: 'Rating',
      cell: ({ row }) => <Stars rating={row.original.rating} />,
    },
    {
      id: 'status',
      header: 'Status',
      enableSorting: false,
      cell: ({ row }) => (
        <Badge variant={row.original.approved ? 'default' : 'secondary'}>
          {row.original.approved ? 'Approved' : 'Waiting'}
        </Badge>
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
          <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Review actions" />}>
            <HugeiconsIcon icon={MoreVerticalIcon} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              disabled={setApproval.isPending}
              onClick={() => setApproval.mutate({ id: row.original.id, approved: !row.original.approved })}
            >
              <HugeiconsIcon icon={row.original.approved ? ViewOffSlashIcon : CheckmarkCircle02Icon} />
              {row.original.approved ? 'Hide from store' : 'Approve'}
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
        title="Reviews"
        description={
          pending > 0
            ? `${formatNumber(pending)} review${pending === 1 ? '' : 's'} waiting for approval`
            : 'Approve reviews before they show in your store'
        }
      />
      <DataTable
        columns={columns}
        data={reviews.data}
        search={search}
        onSearchChange={(changes) => navigate({ search: (prev) => ({ ...prev, ...changes }), replace: true })}
        isPending={reviews.isPending}
        isError={reviews.isError}
        isFetching={reviews.isFetching}
        getRowId={(review) => review.id}
        searchPlaceholder="Search reviews, products or customers"
        emptyMessage={search.q || search.status || search.rating ? 'No reviews match these filters' : 'No reviews yet'}
        filters={[
          {
            name: 'status',
            label: 'Status',
            options: [
              { value: 'pending', label: 'Waiting' },
              { value: 'approved', label: 'Approved' },
            ],
          },
          {
            name: 'rating',
            label: 'Ratings',
            options: ratingFilters.map((value) => ({ value, label: value.replace('-', ' ') })),
          },
        ]}
      />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete this review?"
        description="The review will be removed for good and the product rating updated. This can't be undone."
        pending={deleteReview.isPending}
        onConfirm={() => deleting && deleteReview.mutate(deleting.id, { onSettled: () => setDeleting(null) })}
      />
    </>
  )
}
