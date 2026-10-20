import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useAppForm } from '@/components/form'
import { Button } from '@/components/ui/button'
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

const suggestedIcons = ['🚚', '💳', '🔒', '↩️', '⏰', '🎁', '📞', '✨']

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
      icon: card?.icon ?? '🚚',
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
        <div className="space-y-2">
          <form.AppField name="icon">
            {(field) => <field.TextField label="Icon" description="Type any emoji, or pick one below." />}
          </form.AppField>
          <div className="flex flex-wrap gap-2">
            {suggestedIcons.map((icon) => (
              <Button
                key={icon}
                type="button"
                variant="outline"
                size="icon"
                className="text-lg"
                aria-label={`Use ${icon}`}
                onClick={() => form.setFieldValue('icon', icon)}
              >
                {icon}
              </Button>
            ))}
          </div>
        </div>
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
