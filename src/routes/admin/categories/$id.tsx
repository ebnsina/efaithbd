import { Add01Icon, ArrowLeft01Icon, Delete02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { revalidateLogic } from '@tanstack/react-form'
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link, notFound, useNavigate } from '@tanstack/react-router'
import { useMemo } from 'react'
import { useAppForm } from '@/components/form'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { getAdminCategory } from '@/features/categories/categories.functions'
import { adminCategoryKeys, adminCategoryQuery, useSaveCategory } from '@/features/categories/queries'
import { type CategoryFormValues, categoryFormSchema } from '@/features/categories/schemas'
import { applyServerErrors, formLoadError, formNotFound, LeaveGuard } from '@/features/products/form-helpers'
import { slugify } from '@/features/products/schemas'

const back = { to: '/admin/categories', label: 'Back to categories' } as const

export const Route = createFileRoute('/admin/categories/$id')({
  loader: async ({ context: { queryClient }, params: { id } }) => {
    if (id === 'new') return
    if (!(await queryClient.ensureQueryData(adminCategoryQuery(id)))) throw notFound()
  },
  head: ({ params }) => ({ meta: [{ title: params.id === 'new' ? 'New category' : 'Edit category' }] }),
  component: CategoryPage,
  notFoundComponent: formNotFound('This category could not be found. It may have been deleted.', back),
  errorComponent: formLoadError(back),
})

type Category = NonNullable<Awaited<ReturnType<typeof getAdminCategory>>>

function CategoryPage() {
  const { id } = Route.useParams()
  return id === 'new' ? <CategoryForm category={null} /> : <EditCategory id={id} />
}

function EditCategory({ id }: { id: string }) {
  const { data: category } = useSuspenseQuery(adminCategoryQuery(id))
  if (!category) throw notFound()
  return <CategoryForm category={category} />
}

const toFormValues = (category: Category | null): CategoryFormValues => ({
  name: category?.name ?? '',
  slug: category?.slug ?? '',
  description: category?.description ?? '',
  image: category?.image ?? '',
  subcategories: category?.subcategories ?? [],
})

function CategoryForm({ category }: { category: Category | null }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const save = useSaveCategory(category?.id ?? null)
  const defaultValues = useMemo(() => toFormValues(category), [category])

  const form = useAppForm({
    defaultValues,
    // After the first submit every change re-checks the whole form, so cross-field errors show right away
    validationLogic: revalidateLogic(),
    validators: { onDynamic: categoryFormSchema },
    onSubmit: async ({ value, formApi }) => {
      const result = await save.mutateAsync(value).catch(() => null)
      if (!result) return
      if (!result.ok) return applyServerErrors(formApi, result)
      if (!category) return navigate({ to: '/admin/categories' })
      // Reset from the refetched category so new subcategories pick up their saved ids
      const saved = queryClient.getQueryData<Category | null>(adminCategoryKeys.detail(category.id))
      formApi.reset(saved ? toFormValues(saved) : value)
    },
  })

  return (
    <form
      method="post"
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
      className="mx-auto max-w-3xl space-y-6"
    >
      <LeaveGuard isDirty={() => form.state.isDirty && !form.state.isSubmitting} />
      <div className="flex items-start gap-3">
        <Link to="/admin/categories" className={buttonVariants({ variant: 'ghost', size: 'icon' })} aria-label="Back">
          <HugeiconsIcon icon={ArrowLeft01Icon} />
        </Link>
        <div className="min-w-0">
          <h1 className="font-semibold text-2xl tracking-tight">{category ? 'Edit category' : 'New category'}</h1>
          <p className="mt-1 truncate text-muted-foreground">{category ? category.name : 'Add a group for your products'}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form.AppField
            name="name"
            listeners={{ onChange: ({ value }) => !category && form.setFieldValue('slug', slugify(value)) }}
          >
            {(field) => <field.TextField label="Name" placeholder="e.g. Grocery" />}
          </form.AppField>
          <form.AppField name="slug">
            {(field) => (
              <field.TextField
                label="Web address"
                description="Used in the category link, like /categories/grocery. Letters, numbers and dashes only."
              />
            )}
          </form.AppField>
          <form.AppField name="description">
            {(field) => <field.TextareaField label="Description" description="Optional" rows={4} />}
          </form.AppField>
          <form.AppField name="image">{(field) => <field.ImageField label="Image" />}</form.AppField>
        </CardContent>
      </Card>

      <form.Field name="subcategories" mode="array">
        {(subcategories) => (
          <Card>
            <CardHeader>
              <CardTitle>Subcategories</CardTitle>
              <CardDescription>
                Optional smaller groups inside this category. Removing one keeps its products in this category.
              </CardDescription>
              <CardAction>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => subcategories.pushValue({ id: '', name: '', slug: '' })}
                >
                  <HugeiconsIcon icon={Add01Icon} />
                  Add subcategory
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent className="space-y-3">
              {subcategories.state.value.length === 0 && (
                <p className="text-muted-foreground text-sm">This category has no subcategories.</p>
              )}
              {subcategories.state.value.map((sub, index) => (
                <div key={sub.id || `new-${index}`} className="flex items-start gap-2 rounded-lg border p-3">
                  <div className="grid flex-1 gap-3 sm:grid-cols-2">
                    <form.AppField
                      name={`subcategories[${index}].name`}
                      listeners={{
                        onChange: ({ value }) =>
                          !sub.id && form.setFieldValue(`subcategories[${index}].slug`, slugify(value)),
                      }}
                    >
                      {(field) => <field.TextField label="Name" />}
                    </form.AppField>
                    <form.AppField name={`subcategories[${index}].slug`}>
                      {(field) => <field.TextField label="Web address" />}
                    </form.AppField>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="mt-6"
                    onClick={() => subcategories.removeValue(index)}
                    aria-label={`Remove subcategory ${sub.name || index + 1}`}
                  >
                    <HugeiconsIcon icon={Delete02Icon} />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </form.Field>

      <div className="sticky bottom-0 z-10 -mx-4 flex items-center justify-end gap-3 border-t bg-background/95 px-4 py-3 backdrop-blur">
        <form.Subscribe selector={(state) => state.isDirty}>
          {(isDirty) => isDirty && <span className="mr-auto text-muted-foreground text-sm">Unsaved changes</span>}
        </form.Subscribe>
        <Link to="/admin/categories" className={buttonVariants({ variant: 'outline' })}>
          Cancel
        </Link>
        <form.AppForm>
          <form.SubmitButton
            className="min-w-32"
            label={category ? 'Save changes' : 'Create category'}
            pendingLabel="Saving…"
          />
        </form.AppForm>
      </div>
    </form>
  )
}
