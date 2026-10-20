import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useAppForm } from '@/components/form'
import { type getSection, saveSection } from '@/features/homepage/homepage.functions'
import { sectionQuery, useSaveHomepageItem } from '@/features/homepage/queries'
import { type SectionInput, sectionSchema, sectionTypes } from '@/features/homepage/schemas'
import { EditLayout, FormActions } from '@/features/site-settings/edit-layout'

export const Route = createFileRoute('/admin/homepage/sections/$id')({
  loader: ({ context, params }) =>
    params.id === 'new' ? undefined : context.queryClient.ensureQueryData(sectionQuery(params.id)),
  head: ({ params }) => ({
    meta: [{ title: params.id === 'new' ? 'Add section' : 'Edit section' }],
  }),
  component: SectionPage,
})

function SectionPage() {
  const { id } = Route.useParams()
  return id === 'new' ? <SectionForm /> : <ExistingSection id={id} />
}

function ExistingSection({ id }: { id: string }) {
  const { data } = useSuspenseQuery(sectionQuery(id))
  return <SectionForm section={data} />
}

function SectionForm({ section }: { section?: Awaited<ReturnType<typeof getSection>> }) {
  const navigate = Route.useNavigate()
  const save = useSaveHomepageItem<SectionInput>(saveSection, section?.id, 'Section')
  const form = useAppForm({
    defaultValues: {
      title: section?.title ?? '',
      type: section?.type ?? 'FEATURED',
      limit: section?.limit ?? 10,
      active: section?.active ?? true,
    } as SectionInput,
    validators: { onSubmit: sectionSchema },
    onSubmit: async ({ value }) => {
      if (await save.mutateAsync(value).catch(() => null)) await navigate({ to: '/admin/homepage' })
    },
  })

  return (
    <EditLayout
      back="/admin/homepage"
      title={section ? 'Edit product section' : 'Add product section'}
      description="A row of products on your homepage."
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
        <form.AppField name="title">{(field) => <field.TextField label="Title" placeholder="New arrivals" />}</form.AppField>
        <form.AppField name="type">
          {(field) => (
            <field.SelectField
              label="Products to show"
              options={[...sectionTypes]}
              description="Featured products are the ones marked as featured on the product page."
            />
          )}
        </form.AppField>
        <form.AppField name="limit">
          {(field) => <field.NumberField label="How many products" min={1} max={50} step={1} />}
        </form.AppField>
        <form.AppField name="active">{(field) => <field.SwitchField label="Show on the homepage" />}</form.AppField>
        <FormActions back="/admin/homepage">
          <form.AppForm>
            <form.SubmitButton label={section ? 'Save section' : 'Add section'} pendingLabel="Saving…" />
          </form.AppForm>
        </FormActions>
      </form>
    </EditLayout>
  )
}
