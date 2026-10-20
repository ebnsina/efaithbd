import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useAppForm } from '@/components/form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { getPage } from '@/features/admin-pages/pages.functions'
import { pageQuery, useSavePage } from '@/features/admin-pages/queries'
import { pageSchema, slugify } from '@/features/admin-pages/schemas'
import { Markdown } from '@/features/pages/markdown'
import { siteSettingsQuery } from '@/features/settings/queries'
import { EditLayout, FormActions } from '@/features/site-settings/edit-layout'

export const Route = createFileRoute('/admin/pages/$id')({
  loader: ({ context, params }) =>
    params.id === 'new' ? undefined : context.queryClient.ensureQueryData(pageQuery(params.id)),
  head: ({ params }) => ({
    meta: [{ title: params.id === 'new' ? 'Add page' : 'Edit page' }],
  }),
  component: PageEditor,
})

function PageEditor() {
  const { id } = Route.useParams()
  return id === 'new' ? <PageForm /> : <ExistingPage id={id} />
}

function ExistingPage({ id }: { id: string }) {
  const { data } = useSuspenseQuery(pageQuery(id))
  return <PageForm page={data} />
}

function PageForm({ page }: { page?: Awaited<ReturnType<typeof getPage>> }) {
  const navigate = Route.useNavigate()
  const { data: settings } = useSuspenseQuery(siteSettingsQuery)
  const save = useSavePage(page?.id)
  const form = useAppForm({
    defaultValues: {
      title: page?.title ?? '',
      slug: page?.slug ?? '',
      content: page?.content ?? '',
      metaDescription: page?.metaDescription ?? '',
      published: page?.published ?? true,
    },
    validators: { onSubmit: pageSchema },
    onSubmit: async ({ value }) => {
      const result = await save.mutateAsync(value).catch(() => null)
      if (!result) return
      if (!result.ok) {
        form.setFieldMeta('slug', (meta) => ({
          ...meta,
          isTouched: true,
          errorMap: { ...meta.errorMap, onSubmit: [{ message: result.error }] },
        }))
        return
      }
      await navigate({ to: '/admin/pages' })
    },
  })

  return (
    <EditLayout
      wide
      back="/admin/pages"
      title={page ? 'Edit page' : 'Add page'}
      description="A simple page of text, like About us or Return policy."
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
        <div className="grid gap-6 sm:grid-cols-2">
          <form.AppField
            name="title"
            listeners={{
              // New pages suggest a link from the title until the link is edited by hand
              onChange: ({ value }) => {
                if (!page && !form.getFieldMeta('slug')?.isDirty) {
                  form.setFieldValue('slug', slugify(value), {
                    dontUpdateMeta: true,
                  })
                }
              },
            }}
          >
            {(field) => <field.TextField label="Title" placeholder="Return policy" />}
          </form.AppField>
          <form.AppField name="slug">
            {(field) => (
              <form.Subscribe selector={(state) => state.values.slug}>
                {(slug) => (
                  <field.TextField
                    label="Page link"
                    placeholder="return-policy"
                    description={`The page will be at /${slug || 'your-link'}`}
                  />
                )}
              </form.Subscribe>
            )}
          </form.AppField>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <form.AppField name="content">
            {(field) => (
              <field.TextareaField
                label="Content"
                rows={20}
                className="min-h-80 font-mono text-sm"
                description="Leave an empty line between paragraphs. Start a line with ## for a heading, ### for a smaller heading, or - for a list item. Wrap words in **double stars** to make them bold. Write {siteName} to insert your store name."
              />
            )}
          </form.AppField>
          <Card className="bg-muted/30 lg:sticky lg:top-4 lg:self-start">
            <CardHeader>
              <CardTitle className="text-muted-foreground text-sm">Preview</CardTitle>
            </CardHeader>
            <CardContent className="max-h-[32rem] overflow-y-auto">
              <form.Subscribe selector={(state) => state.values.content}>
                {(content) =>
                  content.trim() ? (
                    <Markdown source={content} siteName={settings?.siteName ?? ''} />
                  ) : (
                    <p className="text-muted-foreground">Nothing to preview yet.</p>
                  )
                }
              </form.Subscribe>
            </CardContent>
          </Card>
        </div>
        <form.AppField name="metaDescription">
          {(field) => (
            <field.TextareaField
              label="Search engine description"
              rows={2}
              description="Optional. A sentence or two shown under the page title in Google results. Up to 160 characters."
            />
          )}
        </form.AppField>
        <form.AppField name="published">
          {(field) => <field.SwitchField label="Published" description="Turn off to hide the page while you work on it." />}
        </form.AppField>
        <FormActions back="/admin/pages">
          <form.AppForm>
            <form.SubmitButton label={page ? 'Save page' : 'Create page'} pendingLabel="Saving…" />
          </form.AppForm>
        </FormActions>
      </form>
    </EditLayout>
  )
}
