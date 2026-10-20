import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useAppForm } from '@/components/form'
import { type getMidBanner, saveMidBanner } from '@/features/homepage/homepage.functions'
import { homepageQuery, midBannerQuery, useSaveHomepageItem } from '@/features/homepage/queries'
import { type MidBannerInput, midBannerSchema } from '@/features/homepage/schemas'
import { EditLayout, FormActions } from '@/features/site-settings/edit-layout'

export const Route = createFileRoute('/admin/homepage/mid-banners/$id')({
  loader: ({ context, params }) =>
    Promise.all([
      context.queryClient.ensureQueryData(homepageQuery()),
      params.id === 'new' ? undefined : context.queryClient.ensureQueryData(midBannerQuery(params.id)),
    ]),
  head: ({ params }) => ({
    meta: [{ title: params.id === 'new' ? 'Add banner' : 'Edit banner' }],
  }),
  component: MidBannerPage,
})

function MidBannerPage() {
  const { id } = Route.useParams()
  return id === 'new' ? <MidBannerForm /> : <ExistingMidBanner id={id} />
}

function ExistingMidBanner({ id }: { id: string }) {
  const { data } = useSuspenseQuery(midBannerQuery(id))
  return <MidBannerForm banner={data} />
}

function MidBannerForm({ banner }: { banner?: Awaited<ReturnType<typeof getMidBanner>> }) {
  const navigate = Route.useNavigate()
  const sections = useQuery(homepageQuery()).data?.sections ?? []
  const save = useSaveHomepageItem<MidBannerInput>(saveMidBanner, banner?.id, 'Banner')
  const position = banner?.position ?? 1
  const count = Math.max(sections.length, position)
  const positions = Array.from({ length: count }, (_, i) => ({
    value: String(i + 1),
    label: sections[i] ? `After “${sections[i].title}”` : `After section ${i + 1}`,
  }))
  const form = useAppForm({
    defaultValues: {
      title: banner?.title ?? '',
      subtitle: banner?.subtitle ?? '',
      image: banner?.image ?? '',
      link: banner?.link ?? '',
      position: String(position),
      active: banner?.active ?? true,
    },
    validators: { onSubmit: midBannerSchema },
    onSubmit: async ({ value }) => {
      if (await save.mutateAsync(value).catch(() => null)) await navigate({ to: '/admin/homepage' })
    },
  })

  return (
    <EditLayout
      back="/admin/homepage"
      title={banner ? 'Edit banner' : 'Add banner'}
      description="A wide image shown between the product sections on your homepage."
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
        <form.AppField name="image">{(field) => <field.ImageField label="Banner image" />}</form.AppField>
        <form.AppField name="position">
          {(field) => (
            <field.SelectField
              label="Where to show it"
              options={positions}
              description="Sections are counted in the order they appear on the homepage."
            />
          )}
        </form.AppField>
        <form.AppField name="title">
          {(field) => <field.TextField label="Title" description="Optional. Shown on top of the image." />}
        </form.AppField>
        <form.AppField name="subtitle">{(field) => <field.TextField label="Subtitle" />}</form.AppField>
        <form.AppField name="link">
          {(field) => (
            <field.TextField
              label="Link"
              placeholder="/products"
              description="Optional. Where shoppers go when they tap the banner."
            />
          )}
        </form.AppField>
        <form.AppField name="active">{(field) => <field.SwitchField label="Show on the homepage" />}</form.AppField>
        <FormActions back="/admin/homepage">
          <form.AppForm>
            <form.SubmitButton label={banner ? 'Save banner' : 'Add banner'} pendingLabel="Saving…" />
          </form.AppForm>
        </FormActions>
      </form>
    </EditLayout>
  )
}
