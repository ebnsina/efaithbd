import { HugeiconsIcon } from '@hugeicons/react'
import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAppForm } from '@/components/form'
import { Field, FieldLabel } from '@/components/ui/field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EditDialog, EditDialogFooter } from '@/features/site-settings/edit-dialog'
import { listHighlights, saveHighlight } from './highlights.functions'
import { type HighlightIconKey, highlightIconKeys, highlightIcons } from './icons'
import { type HighlightInput, highlightSchema } from './schemas'

export type Highlight = Awaited<ReturnType<typeof listHighlights>>[number]

export const highlightKeys = { all: ['admin', 'highlights'] as const }
export const highlightListQuery = () =>
  queryOptions({
    queryKey: highlightKeys.all,
    queryFn: () => listHighlights(),
  })

export function HighlightIcon({ name, className }: { name: string; className?: string }) {
  const entry = highlightIcons[name as HighlightIconKey]
  return entry ? <HugeiconsIcon icon={entry.icon} className={className} /> : null
}

export function HighlightDialog({ highlight, onClose }: { highlight: Highlight | 'new' | null; onClose: () => void }) {
  return (
    <EditDialog
      open={highlight !== null}
      onOpenChange={(open) => !open && onClose()}
      title={highlight === 'new' ? 'Add a highlight' : 'Edit highlight'}
      description="A short promise shown in the strip on your homepage, like fast delivery or easy returns."
    >
      {highlight && (
        <HighlightForm
          key={highlight === 'new' ? 'new' : highlight.id}
          highlight={highlight === 'new' ? undefined : highlight}
          onDone={onClose}
        />
      )}
    </EditDialog>
  )
}

function HighlightForm({ highlight, onDone }: { highlight?: Highlight; onDone: () => void }) {
  const queryClient = useQueryClient()
  const save = useMutation({
    mutationFn: (values: HighlightInput) => saveHighlight({ data: { id: highlight?.id, values } }),
    onSuccess: () => {
      toast.success(highlight ? 'Highlight saved' : 'Highlight added')
      return queryClient.invalidateQueries({ queryKey: highlightKeys.all })
    },
    onError: () => toast.error('Could not save this highlight. Please try again.'),
  })
  const form = useAppForm({
    defaultValues: {
      title: highlight?.title ?? '',
      subtitle: highlight?.subtitle ?? '',
      icon: (highlight?.icon ?? 'delivery') as HighlightIconKey,
      link: highlight?.link ?? '',
      active: highlight?.active ?? true,
    },
    validators: { onSubmit: highlightSchema },
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
      <form.Field name="icon">
        {(field) => (
          <Field>
            <FieldLabel htmlFor="icon">Icon</FieldLabel>
            <Select value={field.state.value} onValueChange={(value) => value && field.handleChange(value)}>
              <SelectTrigger id="icon" className="w-full">
                <SelectValue>
                  {(value: HighlightIconKey) => (
                    <>
                      <HighlightIcon name={value} />
                      {highlightIcons[value]?.label}
                    </>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {highlightIconKeys.map((key) => (
                  <SelectItem key={key} value={key}>
                    <HighlightIcon name={key} />
                    {highlightIcons[key].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        )}
      </form.Field>
      <form.AppField name="title">
        {(field) => <field.TextField label="Title" placeholder="Fast delivery" />}
      </form.AppField>
      <form.AppField name="subtitle">
        {(field) => <field.TextField label="Subtitle" placeholder="All over Bangladesh" />}
      </form.AppField>
      <form.AppField name="link">
        {(field) => (
          <field.TextField
            label="Link"
            placeholder="/faq"
            description="Optional. Where shoppers go when they tap it."
          />
        )}
      </form.AppField>
      <form.AppField name="active">{(field) => <field.SwitchField label="Show on the homepage" />}</form.AppField>
      <EditDialogFooter>
        <form.AppForm>
          <form.SubmitButton label={highlight ? 'Save' : 'Add'} pendingLabel="Saving…" />
        </form.AppForm>
      </EditDialogFooter>
    </form>
  )
}
