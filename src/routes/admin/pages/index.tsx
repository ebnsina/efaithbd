import { Add01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { PageHeader } from '@/components/page-header'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import type { listPages } from '@/features/admin-pages/pages.functions'
import { pageKeys, pageListQuery } from '@/features/admin-pages/queries'
import { RowActions } from '@/features/site-settings/row-actions'
import { useDeleteRow } from '@/features/site-settings/rows'
import { type SortableColumn, SortableTable } from '@/features/site-settings/sortable-table'
import { formatDate } from '@/lib/format'

export const Route = createFileRoute('/admin/pages/')({
  loader: ({ context }) => context.queryClient.ensureQueryData(pageListQuery()),
  head: () => ({ meta: [{ title: 'Pages' }] }),
  component: PagesPage,
})

type Page = Awaited<ReturnType<typeof listPages>>[number]

function PagesPage() {
  const pages = useQuery(pageListQuery())
  const deletePage = useDeleteRow('page', pageKeys.all, 'Page')
  const [deleting, setDeleting] = useState<Page | null>(null)

  const columns: SortableColumn<Page>[] = [
    {
      id: 'title',
      header: 'Page',
      cell: ({ row }) => (
        <div className="min-w-48">
          <div className="font-medium">{row.original.title}</div>
          <a
            href={`/${row.original.slug}`}
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground text-xs hover:text-foreground hover:underline"
          >
            /{row.original.slug}
          </a>
        </div>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.published ? 'default' : 'secondary'}>
          {row.original.published ? 'Published' : 'Draft'}
        </Badge>
      ),
    },
    {
      id: 'updated',
      header: 'Last changed',
      cell: ({ row }) => formatDate(row.original.updatedAt),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <RowActions
          label={row.original.title}
          editLink={<Link to="/admin/pages/$id" params={{ id: row.original.id }} />}
          onDelete={() => setDeleting(row.original)}
        />
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="Pages"
        description="Simple pages like About us, Terms and Privacy policy."
        action={
          <Link to="/admin/pages/$id" params={{ id: 'new' }} className={buttonVariants()}>
            <HugeiconsIcon icon={Add01Icon} />
            Add page
          </Link>
        }
      />
      <SortableTable
        columns={columns}
        rows={pages.data}
        isPending={pages.isPending}
        isError={pages.isError}
        emptyMessage="No pages yet."
        rowLabel={(page) => page.title}
      />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete this page?"
        description={`“${deleting?.title}” will be removed and its link will stop working. Remove it from your menu and footer too. This can't be undone.`}
        pending={deletePage.isPending}
        onConfirm={() => deleting && deletePage.mutate(deleting.id, { onSettled: () => setDeleting(null) })}
      />
    </>
  )
}
