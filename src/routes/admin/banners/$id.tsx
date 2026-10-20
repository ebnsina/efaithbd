import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useAppForm } from '@/components/form'
import type { getBanner } from '@/features/banners/banners.functions'
import { bannerQuery, useSaveBanner } from '@/features/banners/queries'
import { bannerSchema } from '@/features/banners/schemas'
import { EditLayout, FormActions } from '@/features/site-settings/edit-layout'

export const Route = createFileRoute('/admin/banners/$id')({
  loader: ({ context, params }) =>
    params.id === 'new' ? undefined : context.queryClient.ensureQueryData(bannerQuery(params.id)),
  head: ({ params }) => ({
    meta: [{ title: params.id === 'new' ? 'Add banner' : 'Edit banner' }],
  }),
  component: BannerPage,
})

function BannerPage() {
  const { id } = Route.useParams()
  return id === 'new' ? <BannerForm /> : <ExistingBanner id={id} />
}

function ExistingBanner({ id }: { id: string }) {
  const { data } = useSuspenseQuery(bannerQuery(id))
  return <BannerForm banner={data} />
}

function BannerForm({ banner }: { banner?: Awaited<ReturnType<typeof getBanner>> }) {
  const navigate = Route.useNavigate()
  const save = useSaveBanner(banner?.id)
  const form = useAppForm({
    defaultValues: {
      title: banner?.title ?? '',
      subtitle: banner?.subtitle ?? '',
      image: banner?.image ?? '',
      link: banner?.link ?? '',
      active: banner?.active ?? true,
    },
    validators: { onSubmit: bannerSchema },
    onSubmit: async ({ value }) => {
      if (await save.mutateAsync(value).catch(() => null)) await navigate({ to: '/admin/banners' })
    },
  })

  return (
    <EditLayout
      back="/admin/banners"
      title={banner ? 'Edit banner' : 'Add banner'}
      description="A wide image shown in the slider at the top of your homepage."
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
        <FormActions back="/admin/banners">
          <form.AppForm>
            <form.SubmitButton label={banner ? 'Save banner' : 'Add banner'} pendingLabel="Saving…" />
          </form.AppForm>
        </FormActions>
      </form>
    </EditLayout>
  )
}
