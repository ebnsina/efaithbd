import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAppForm } from '@/components/form'
import { EditDialog, EditDialogFooter } from '@/features/site-settings/edit-dialog'
import { listFaqs, saveFaq } from './faqs.functions'
import { type FaqInput, faqSchema } from './schemas'

export type Faq = Awaited<ReturnType<typeof listFaqs>>[number]

export const faqKeys = { all: ['admin', 'faqs'] as const }
export const faqListQuery = () => queryOptions({ queryKey: faqKeys.all, queryFn: () => listFaqs() })

export function FaqDialog({ faq, onClose }: { faq: Faq | 'new' | null; onClose: () => void }) {
  return (
    <EditDialog
      open={faq !== null}
      onOpenChange={(open) => !open && onClose()}
      title={faq === 'new' ? 'Add a question' : 'Edit question'}
      description="Shown on your FAQ page."
    >
      {faq && <FaqForm key={faq === 'new' ? 'new' : faq.id} faq={faq === 'new' ? undefined : faq} onDone={onClose} />}
    </EditDialog>
  )
}

function FaqForm({ faq, onDone }: { faq?: Faq; onDone: () => void }) {
  const queryClient = useQueryClient()
  const save = useMutation({
    mutationFn: (values: FaqInput) => saveFaq({ data: { id: faq?.id, values } }),
    onSuccess: () => {
      toast.success(faq ? 'Question saved' : 'Question added')
      return queryClient.invalidateQueries({ queryKey: faqKeys.all })
    },
    onError: () => toast.error('Could not save this question. Please try again.'),
  })
  const form = useAppForm({
    defaultValues: {
      question: faq?.question ?? '',
      answer: faq?.answer ?? '',
      active: faq?.active ?? true,
    },
    validators: { onSubmit: faqSchema },
    onSubmit: async ({ value }) => {
      if (await save.mutateAsync(value).catch(() => null)) onDone()
    },
  })

  return (
    <form
      method="post"
      noValidate
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
    >
      <form.AppField name="question">{(field) => <field.TextField label="Question" />}</form.AppField>
      <form.AppField name="answer">{(field) => <field.TextareaField label="Answer" rows={5} />}</form.AppField>
      <form.AppField name="active">{(field) => <field.SwitchField label="Show on the FAQ page" />}</form.AppField>
      <EditDialogFooter>
        <form.AppForm>
          <form.SubmitButton label={faq ? 'Save' : 'Add'} pendingLabel="Saving…" />
        </form.AppForm>
      </EditDialogFooter>
    </form>
  )
}
