import { Add01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { type Faq, FaqDialog, faqKeys, faqListQuery } from '@/features/faqs/faq-dialog'
import { RowActions } from '@/features/site-settings/row-actions'
import { ActiveSwitch, sortByIds, useDeleteRow, useReorderRows } from '@/features/site-settings/rows'
import { type SortableColumn, SortableTable } from '@/features/site-settings/sortable-table'

export const Route = createFileRoute('/admin/faqs/')({
  loader: ({ context }) => context.queryClient.ensureQueryData(faqListQuery()),
  head: () => ({ meta: [{ title: 'FAQs' }] }),
  component: FaqsPage,
})

function FaqsPage() {
  const faqs = useQuery(faqListQuery())
  const reorder = useReorderRows<Faq[]>('faq', faqKeys.all, sortByIds)
  const deleteFaq = useDeleteRow('faq', faqKeys.all, 'Question')
  const [editing, setEditing] = useState<Faq | 'new' | null>(null)
  const [deleting, setDeleting] = useState<Faq | null>(null)

  const columns: SortableColumn<Faq>[] = [
    {
      id: 'question',
      header: 'Question',
      cell: ({ row }) => (
        <div className="min-w-56 max-w-xl whitespace-normal">
          <div className="font-medium">{row.original.question}</div>
          <div className="line-clamp-2 text-muted-foreground text-xs">{row.original.answer}</div>
        </div>
      ),
    },
    {
      id: 'active',
      header: 'Shown',
      cell: ({ row }) => (
        <ActiveSwitch
          table="faq"
          id={row.original.id}
          active={row.original.active}
          queryKey={faqKeys.all}
          label="This question"
        />
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <RowActions
          label={row.original.question}
          onEdit={() => setEditing(row.original)}
          onDelete={() => setDeleting(row.original)}
        />
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="FAQs"
        description="Questions and answers on your FAQ page. Drag to change the order."
        action={
          <Button onClick={() => setEditing('new')}>
            <HugeiconsIcon icon={Add01Icon} />
            Add question
          </Button>
        }
      />
      <SortableTable
        columns={columns}
        rows={faqs.data}
        isPending={faqs.isPending}
        isError={faqs.isError}
        emptyMessage="No questions yet. Add the ones shoppers ask most."
        rowLabel={(faq) => faq.question}
        onReorder={(ids) => reorder.mutate(ids)}
      />
      <FaqDialog faq={editing} onClose={() => setEditing(null)} />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete this question?"
        description={`“${deleting?.question}” will be removed from your FAQ page. This can't be undone.`}
        pending={deleteFaq.isPending}
        onConfirm={() => deleting && deleteFaq.mutate(deleting.id, { onSettled: () => setDeleting(null) })}
      />
    </>
  )
}
