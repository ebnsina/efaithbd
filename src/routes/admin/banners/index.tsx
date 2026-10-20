import { Add01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { PageHeader } from '@/components/page-header'
import { buttonVariants } from '@/components/ui/button'
import type { listBanners } from '@/features/banners/banners.functions'
import { bannerKeys, bannerListQuery } from '@/features/banners/queries'
import { RowActions } from '@/features/site-settings/row-actions'
import { ActiveSwitch, sortByIds, useDeleteRow, useReorderRows } from '@/features/site-settings/rows'
import { type SortableColumn, SortableTable } from '@/features/site-settings/sortable-table'

export const Route = createFileRoute('/admin/banners/')({
  loader: ({ context }) => context.queryClient.ensureQueryData(bannerListQuery()),
  head: () => ({ meta: [{ title: 'Banners' }] }),
  component: BannersPage,
})

type Banner = Awaited<ReturnType<typeof listBanners>>[number]

function BannersPage() {
  const banners = useQuery(bannerListQuery())
  const reorder = useReorderRows<Banner[]>('banner', bannerKeys.list(), sortByIds)
  const deleteBanner = useDeleteRow('banner', bannerKeys.all, 'Banner')
  const [deleting, setDeleting] = useState<Banner | null>(null)

  const columns: SortableColumn<Banner>[] = [
    {
      id: 'image',
      header: 'Image',
      cell: ({ row }) => (
        <img src={row.original.image} alt="" loading="lazy" className="h-14 w-24 rounded-md bg-muted object-cover" />
      ),
    },
    {
      id: 'title',
      header: 'Title',
      cell: ({ row }) => (
        <div className="min-w-48">
          <div className="font-medium">{row.original.title || 'No title'}</div>
          {row.original.subtitle && <div className="text-muted-foreground text-xs">{row.original.subtitle}</div>}
        </div>
      ),
    },
    {
      id: 'active',
      header: 'Shown',
      cell: ({ row }) => (
        <ActiveSwitch
          table="banner"
          id={row.original.id}
          active={row.original.active}
          queryKey={bannerKeys.all}
          label={row.original.title || 'This banner'}
        />
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <RowActions
          label={row.original.title || 'banner'}
          editLink={<Link to="/admin/banners/$id" params={{ id: row.original.id }} />}
          onDelete={() => setDeleting(row.original)}
        />
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="Banners"
        description="The slides at the top of your homepage. Drag to change the order."
        action={
          <Link to="/admin/banners/$id" params={{ id: 'new' }} className={buttonVariants()}>
            <HugeiconsIcon icon={Add01Icon} />
            Add banner
          </Link>
        }
      />
      <SortableTable
        columns={columns}
        rows={banners.data}
        isPending={banners.isPending}
        isError={banners.isError}
        emptyMessage="No banners yet. Add one to show it on your homepage."
        rowLabel={(banner) => banner.title || 'banner'}
        onReorder={(ids) => reorder.mutate(ids)}
      />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete this banner?"
        description="It will be removed from your homepage. This can't be undone."
        pending={deleteBanner.isPending}
        onConfirm={() =>
          deleting &&
          deleteBanner.mutate(deleting.id, {
            onSettled: () => setDeleting(null),
          })
        }
      />
    </>
  )
}
