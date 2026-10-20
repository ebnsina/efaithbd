import {
  CheckmarkCircle02Icon,
  Delete02Icon,
  MoreVerticalIcon,
  PencilEdit02Icon,
  ReplyIcon,
  ViewIcon,
  ViewOffSlashIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, stripSearchParams } from '@tanstack/react-router'
import { useState } from 'react'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type DataColumn, DataTable } from '@/components/data-table'
import { useAppForm } from '@/components/form'
import { PageHeader } from '@/components/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { listAdminQuestions } from '@/features/admin-questions/admin-questions.functions'
import {
  adminQuestionListQuery,
  adminQuestionQuery,
  useCreateAnswer,
  useDeleteAnswer,
  useDeleteQuestion,
  useSetAnswerApproval,
  useSetQuestionApproval,
  useUpdateAnswer,
} from '@/features/admin-questions/queries'
import { answerFormSchema, questionSearchSchema } from '@/features/admin-questions/schemas'
import { formatDate, formatNumber } from '@/lib/format'
import { listSearchDefaults } from '@/lib/list-search'

export const Route = createFileRoute('/admin/questions/')({
  validateSearch: questionSearchSchema,
  search: { middlewares: [stripSearchParams(listSearchDefaults)] },
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) => context.queryClient.ensureQueryData(adminQuestionListQuery(deps)),
  head: () => ({ meta: [{ title: 'Questions' }] }),
  component: QuestionsPage,
})

type Question = Awaited<ReturnType<typeof listAdminQuestions>>['rows'][number]
type Answer = Question['answers'][number]

function QuestionsPage() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const questions = useQuery(adminQuestionListQuery(search))
  const setApproval = useSetQuestionApproval()
  const deleteQuestion = useDeleteQuestion()
  const [deleting, setDeleting] = useState<Question | null>(null)
  const [opened, setOpened] = useState<Question | null>(null)
  const pending = questions.data?.pendingCount ?? 0

  const columns: DataColumn<Question>[] = [
    {
      id: 'question',
      header: 'Question',
      enableSorting: false,
      cell: ({ row }) => (
        <div className="min-w-56 max-w-md whitespace-normal">
          <button type="button" onClick={() => setOpened(row.original)} className="text-left font-medium hover:underline">
            {row.original.question}
          </button>
          <div className="text-muted-foreground text-xs">
            {row.original.user?.name ?? 'Guest'} on{' '}
            <a href={`/products/${row.original.product.slug}`} target="_blank" rel="noreferrer" className="underline">
              {row.original.product.name}
            </a>
          </div>
        </div>
      ),
    },
    {
      id: 'answers',
      header: 'Answers',
      enableSorting: false,
      cell: ({ row }) =>
        row.original.answers.length > 0 ? (
          formatNumber(row.original.answers.length)
        ) : (
          <Badge variant="outline">Unanswered</Badge>
        ),
    },
    {
      id: 'status',
      header: 'Status',
      enableSorting: false,
      cell: ({ row }) => (
        <Badge variant={row.original.approved ? 'default' : 'secondary'}>
          {row.original.approved ? 'Published' : 'Waiting'}
        </Badge>
      ),
    },
    {
      id: 'createdAt',
      accessorKey: 'createdAt',
      header: 'Asked',
      cell: ({ row }) => <span className="text-muted-foreground">{formatDate(row.original.createdAt)}</span>,
    },
    {
      id: 'actions',
      header: '',
      enableSorting: false,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Question actions" />}>
            <HugeiconsIcon icon={MoreVerticalIcon} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setOpened(row.original)}>
              <HugeiconsIcon icon={ReplyIcon} />
              Answers
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={setApproval.isPending}
              onClick={() => setApproval.mutate({ id: row.original.id, approved: !row.original.approved })}
            >
              <HugeiconsIcon icon={row.original.approved ? ViewOffSlashIcon : CheckmarkCircle02Icon} />
              {row.original.approved ? 'Hide from store' : 'Publish'}
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
        title="Questions"
        description={
          pending > 0
            ? `${formatNumber(pending)} question${pending === 1 ? '' : 's'} waiting to be published`
            : 'Answer customer questions about your products'
        }
      />
      <DataTable
        columns={columns}
        data={questions.data}
        search={search}
        onSearchChange={(changes) => navigate({ search: (prev) => ({ ...prev, ...changes }), replace: true })}
        isPending={questions.isPending}
        isError={questions.isError}
        isFetching={questions.isFetching}
        getRowId={(question) => question.id}
        searchPlaceholder="Search questions, products or customers"
        emptyMessage={search.q || search.status || search.answered ? 'No questions match these filters' : 'No questions yet'}
        filters={[
          {
            name: 'status',
            label: 'Status',
            options: [
              { value: 'pending', label: 'Waiting' },
              { value: 'published', label: 'Published' },
            ],
          },
          {
            name: 'answered',
            label: 'Answers',
            options: [
              { value: 'unanswered', label: 'Unanswered' },
              { value: 'answered', label: 'Answered' },
            ],
          },
        ]}
      />
      <AnswersDialog opened={opened} onClose={() => setOpened(null)} />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete this question?"
        description="The question and all its answers will be removed for good. This can't be undone."
        pending={deleteQuestion.isPending}
        onConfirm={() => deleting && deleteQuestion.mutate(deleting.id, { onSettled: () => setDeleting(null) })}
      />
    </>
  )
}

// Loads the question on its own so it stays current even when a list filter drops it after answering
function AnswersDialog({ opened, onClose }: { opened: Question | null; onClose: () => void }) {
  const createAnswer = useCreateAnswer()
  const live = useQuery({
    ...adminQuestionQuery(opened?.id ?? ''),
    enabled: !!opened,
    placeholderData: opened ?? undefined,
  })
  const question = live.data
  return (
    <Dialog open={!!opened} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        {opened && !question && !live.isFetching && (
          <DialogHeader>
            <DialogTitle>Question not found</DialogTitle>
            <DialogDescription>
              {live.isError ? 'This question could not be loaded. Please try again.' : 'This question has been deleted.'}
            </DialogDescription>
          </DialogHeader>
        )}
        {question && (
          <>
            <DialogHeader>
              <DialogTitle className="pr-6 leading-snug">{question.question}</DialogTitle>
              <DialogDescription>
                Asked by {question.user?.name ?? 'a guest'} about {question.product.name} on {formatDate(question.createdAt)}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              {question.answers.length === 0 && <p className="text-muted-foreground text-sm">No answers yet.</p>}
              {question.answers.map((answer) => (
                <AnswerItem key={answer.id} answer={answer} />
              ))}
            </div>
            <AnswerForm
              key={question.id}
              initial=""
              label="Your answer"
              description={question.approved ? undefined : 'Posting an answer also publishes this question in the store.'}
              submitLabel="Post answer"
              onSave={(values) => createAnswer.mutateAsync({ questionId: question.id, values })}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

function AnswerItem({ answer }: { answer: Answer }) {
  const [editing, setEditing] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const updateAnswer = useUpdateAnswer()
  const setApproval = useSetAnswerApproval()
  const deleteAnswer = useDeleteAnswer()

  return (
    <div className="space-y-2 rounded-lg border bg-muted/40 p-3">
      {editing ? (
        <AnswerForm
          initial={answer.answer}
          label="Edit answer"
          submitLabel="Save"
          onCancel={() => setEditing(false)}
          onSave={(values) => updateAnswer.mutateAsync({ id: answer.id, values }).then(() => setEditing(false))}
        />
      ) : (
        <>
          <p className="whitespace-pre-line text-sm">{answer.answer}</p>
          <div className="flex flex-wrap items-center gap-2 text-muted-foreground text-xs">
            <span>
              {answer.user?.name ?? 'Guest'} · {formatDate(answer.createdAt)}
            </span>
            {answer.isOfficial && <Badge>Store answer</Badge>}
            {!answer.approved && <Badge variant="secondary">Hidden</Badge>}
          </div>
          <div className="flex flex-wrap gap-1">
            <Button type="button" variant="ghost" size="xs" onClick={() => setEditing(true)}>
              <HugeiconsIcon icon={PencilEdit02Icon} />
              Edit
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="xs"
              disabled={setApproval.isPending}
              onClick={() => setApproval.mutate({ id: answer.id, approved: !answer.approved })}
            >
              <HugeiconsIcon icon={answer.approved ? ViewOffSlashIcon : ViewIcon} />
              {answer.approved ? 'Hide' : 'Show in store'}
            </Button>
            <Button type="button" variant="ghost" size="xs" className="text-destructive" onClick={() => setConfirming(true)}>
              <HugeiconsIcon icon={Delete02Icon} />
              Delete
            </Button>
          </div>
        </>
      )}
      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title="Delete this answer?"
        description="The answer will be removed for good. This can't be undone."
        pending={deleteAnswer.isPending}
        onConfirm={() => deleteAnswer.mutate(answer.id, { onSettled: () => setConfirming(false) })}
      />
    </div>
  )
}

function AnswerForm({
  initial,
  label,
  description,
  submitLabel,
  onSave,
  onCancel,
}: {
  initial: string
  label: string
  description?: string
  submitLabel: string
  onSave: (values: { answer: string }) => Promise<unknown>
  onCancel?: () => void
}) {
  const form = useAppForm({
    defaultValues: { answer: initial },
    validators: { onSubmit: answerFormSchema },
    // The mutation already shows the error toast; catching keeps what was typed
    onSubmit: ({ value, formApi }) =>
      onSave(value)
        .then(() => formApi.reset({ answer: '' }))
        .catch(() => {}),
  })
  return (
    <form
      method="post"
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
      className="space-y-3"
    >
      <form.AppField name="answer">
        {(field) => <field.TextareaField label={label} description={description} rows={3} />}
      </form.AppField>
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <form.AppForm>
          <form.SubmitButton className="min-w-32" label={submitLabel} pendingLabel="Saving…" />
        </form.AppForm>
      </div>
    </form>
  )
}
