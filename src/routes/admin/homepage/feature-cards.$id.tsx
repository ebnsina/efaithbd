import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useAppForm } from '@/components/form'
import { Field, FieldLabel } from '@/components/ui/field'
import { IconSelect } from '@/features/highlights/icon-select'
import type { HighlightIconKey } from '@/features/highlights/icons'
import { type getFeatureCard, saveFeatureCard } from '@/features/homepage/homepage.functions'
import { featureCardQuery, useSaveHomepageItem } from '@/features/homepage/queries'
import { type FeatureCardInput, featureCardSchema } from '@/features/homepage/schemas'
import { EditLayout, FormActions } from '@/features/site-settings/edit-layout'

export const Route = createFileRoute('/admin/homepage/feature-cards/$id')({
  loader: ({ context, params }) =>
    params.id === 'new' ? undefined : context.queryClient.ensureQueryData(featureCardQuery(params.id)),
  head: ({ params }) => ({
    meta: [{ title: params.id === 'new' ? 'Add feature card' : 'Edit feature card' }],
  }),
  component: FeatureCardPage,
})

function FeatureCardPage() {
  const { id } = Route.useParams()
  return id === 'new' ? <FeatureCardForm /> : <ExistingCard id={id} />
}

function ExistingCard({ id }: { id: string }) {
  const { data } = useSuspenseQuery(featureCardQuery(id))
  return <FeatureCardForm card={data} />
}

function FeatureCardForm({ card }: { card?: Awaited<ReturnType<typeof getFeatureCard>> }) {
  const navigate = Route.useNavigate()
  const save = useSaveHomepageItem<FeatureCardInput>(saveFeatureCard, card?.id, 'Feature card')
  const form = useAppForm({
    defaultValues: {
      icon: (card?.icon ?? 'delivery') as HighlightIconKey,
      title: card?.title ?? '',
      description: card?.description ?? '',
      active: card?.active ?? true,
    },
    validators: { onSubmit: featureCardSchema },
    onSubmit: async ({ value }) => {
      if (await save.mutateAsync(value).catch(() => null)) await navigate({ to: '/admin/homepage' })
    },
  })

  return (
    <EditLayout
      back="/admin/homepage"
      title={card ? 'Edit feature card' : 'Add feature card'}
      description="A small card with an icon, such as free delivery or secure payment."
    >
      <form
        method="post"
        noValidate
        className="space-y-6"
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
      >
        <form.Field name="icon">
          {(field) => (
            <Field>
              <FieldLabel htmlFor="icon">Icon</FieldLabel>
              <IconSelect id="icon" value={field.state.value} onChange={field.handleChange} />
            </Field>
          )}
        </form.Field>
        <form.AppField name="title">
          {(field) => <field.TextField label="Title" placeholder="Free delivery" />}
        </form.AppField>
        <form.AppField name="description">
          {(field) => <field.TextareaField label="Description" rows={3} placeholder="On orders over ৳1000" />}
        </form.AppField>
        <form.AppField name="active">{(field) => <field.SwitchField label="Show on the homepage" />}</form.AppField>
        <FormActions back="/admin/homepage">
          <form.AppForm>
            <form.SubmitButton label={card ? 'Save card' : 'Add card'} pendingLabel="Saving…" />
          </form.AppForm>
        </FormActions>
      </form>
    </EditLayout>
  )
}
