import { Add01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import {
  type Highlight,
  HighlightDialog,
  HighlightIcon,
  highlightKeys,
  highlightListQuery,
} from '@/features/highlights/highlight-dialog'
import { RowActions } from '@/features/site-settings/row-actions'
import { ActiveSwitch, sortByIds, useDeleteRow, useReorderRows } from '@/features/site-settings/rows'
import { type SortableColumn, SortableTable } from '@/features/site-settings/sortable-table'

export const Route = createFileRoute('/admin/highlights/')({
  loader: ({ context }) => context.queryClient.ensureQueryData(highlightListQuery()),
  head: () => ({ meta: [{ title: 'Highlights' }] }),
  component: HighlightsPage,
})

function HighlightsPage() {
  const highlights = useQuery(highlightListQuery())
  const reorder = useReorderRows<Highlight[]>('highlight', highlightKeys.all, sortByIds)
  const deleteHighlight = useDeleteRow('highlight', highlightKeys.all, 'Highlight')
  const [editing, setEditing] = useState<Highlight | 'new' | null>(null)
  const [deleting, setDeleting] = useState<Highlight | null>(null)

  const columns: SortableColumn<Highlight>[] = [
    {
      id: 'title',
      header: 'Highlight',
      cell: ({ row }) => (
        <div className="flex min-w-48 items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <HighlightIcon name={row.original.icon} className="size-5" />
          </div>
          <div>
            <div className="font-medium">{row.original.title}</div>
            {row.original.subtitle && <div className="text-muted-foreground text-xs">{row.original.subtitle}</div>}
          </div>
        </div>
      ),
    },
    {
      id: 'link',
      header: 'Link',
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.link || '—'}</span>,
    },
    {
      id: 'active',
      header: 'Shown',
      cell: ({ row }) => (
        <ActiveSwitch
          table="highlight"
          id={row.original.id}
          active={row.original.active}
          queryKey={highlightKeys.all}
          label={row.original.title}
        />
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <RowActions
          label={row.original.title}
          onEdit={() => setEditing(row.original)}
          onDelete={() => setDeleting(row.original)}
        />
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="Highlights"
        description="The strip of short promises on your homepage. Drag to change the order."
        action={
          <Button onClick={() => setEditing('new')}>
            <HugeiconsIcon icon={Add01Icon} />
            Add highlight
          </Button>
        }
      />
      <SortableTable
        columns={columns}
        rows={highlights.data}
        isPending={highlights.isPending}
        isError={highlights.isError}
        emptyMessage="No highlights yet. Add one, like fast delivery or easy returns."
        rowLabel={(highlight) => highlight.title}
        onReorder={(ids) => reorder.mutate(ids)}
      />
      <HighlightDialog highlight={editing} onClose={() => setEditing(null)} />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete this highlight?"
        description={`“${deleting?.title}” will be removed from your homepage. This can't be undone.`}
        pending={deleteHighlight.isPending}
        onConfirm={() =>
          deleting &&
          deleteHighlight.mutate(deleting.id, {
            onSettled: () => setDeleting(null),
          })
        }
      />
    </>
  )
}
