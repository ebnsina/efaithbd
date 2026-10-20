import { Add01Icon, ArrowLeft01Icon, Delete02Icon, LinkSquare02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { revalidateLogic } from '@tanstack/react-form'
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link, notFound, useNavigate } from '@tanstack/react-router'
import { useMemo } from 'react'
import { useAppForm } from '@/components/form'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { categoryOptionsQuery } from '@/features/categories/queries'
import type { AdminProductDetail } from '@/features/products/admin-products.functions'
import { adminProductKeys, adminProductQuery, useSaveProduct } from '@/features/products/admin-queries'
import { applyServerErrors, formLoadError, formNotFound, LeaveGuard } from '@/features/products/form-helpers'
import { MAX_PRODUCT_IMAGES, type ProductFormValues, productFormSchema, slugify } from '@/features/products/schemas'
import { siteSettingsQuery } from '@/features/settings/queries'
import { formatNumber } from '@/lib/format'

const back = { to: '/admin/products', label: 'Back to products' } as const

export const Route = createFileRoute('/admin/products/$id')({
  loader: async ({ context: { queryClient }, params: { id } }) => {
    const [, product] = await Promise.all([
      queryClient.ensureQueryData(categoryOptionsQuery),
      id === 'new' ? null : queryClient.ensureQueryData(adminProductQuery(id)),
    ])
    if (id !== 'new' && !product) throw notFound()
  },
  head: ({ params }) => ({ meta: [{ title: params.id === 'new' ? 'New product' : 'Edit product' }] }),
  component: ProductPage,
  notFoundComponent: formNotFound('This product could not be found. It may have been deleted.', back),
  errorComponent: formLoadError(back),
})

function ProductPage() {
  const { id } = Route.useParams()
  return id === 'new' ? <ProductForm product={null} /> : <EditProduct id={id} />
}

function EditProduct({ id }: { id: string }) {
  const { data: product } = useSuspenseQuery(adminProductQuery(id))
  if (!product) throw notFound()
  return <ProductForm product={product} />
}

const emptyVariant = { id: '', name: '', value: '', price: null, stock: 0, sku: '' }

const toFormValues = (product: AdminProductDetail | null): ProductFormValues =>
  product
    ? {
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        comparePrice: product.comparePrice,
        stock: product.stock,
        images: product.images,
        categoryId: product.categoryId,
        subcategoryId: product.subcategoryId ?? '',
        featured: product.featured,
        active: product.active,
        variants: product.variants.map((variant) => ({ ...variant, sku: variant.sku ?? '' })),
      }
    : {
        name: '',
        slug: '',
        description: '',
        price: null,
        comparePrice: null,
        stock: 0,
        images: [],
        categoryId: '',
        subcategoryId: '',
        featured: false,
        active: true,
        variants: [],
      }

function ProductForm({ product }: { product: AdminProductDetail | null }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: categories } = useSuspenseQuery(categoryOptionsQuery)
  const { data: settings } = useSuspenseQuery(siteSettingsQuery)
  const currency = settings?.currencySymbol ? ` (${settings.currencySymbol})` : ''
  const save = useSaveProduct(product?.id ?? null)
  const defaultValues = useMemo(() => toFormValues(product), [product])

  const form = useAppForm({
    defaultValues,
    // After the first submit every change re-checks the whole form, so cross-field errors show right away
    validationLogic: revalidateLogic(),
    validators: { onDynamic: productFormSchema },
    onSubmit: async ({ value, formApi }) => {
      const result = await save.mutateAsync(value).catch(() => null)
      if (!result) return
      if (!result.ok) return applyServerErrors(formApi, result)
      if (!product) return navigate({ to: '/admin/products' })
      // Reset from the refetched product so new variants pick up their saved ids
      const saved = queryClient.getQueryData<AdminProductDetail | null>(adminProductKeys.detail(product.id))
      formApi.reset(saved ? toFormValues(saved) : value)
    },
  })

  const categoryOptions = categories.map((category) => ({ value: category.id, label: category.name }))

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
        <Link to="/admin/products" className={buttonVariants({ variant: 'ghost', size: 'icon' })} aria-label="Back">
          <HugeiconsIcon icon={ArrowLeft01Icon} />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="font-semibold text-2xl tracking-tight">{product ? 'Edit product' : 'New product'}</h1>
          <p className="mt-1 truncate text-muted-foreground">{product ? product.name : 'Add a product to your store'}</p>
        </div>
        {product && (
          <a
            href={`/products/${product.slug}`}
            target="_blank"
            rel="noreferrer"
            className={buttonVariants({ variant: 'outline', size: 'sm' })}
          >
            <HugeiconsIcon icon={LinkSquare02Icon} />
            <span className="max-sm:sr-only">View in store</span>
          </a>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form.AppField
            name="name"
            listeners={{ onChange: ({ value }) => !product && form.setFieldValue('slug', slugify(value)) }}
          >
            {(field) => <field.TextField label="Name" placeholder="e.g. Mustard oil 1 litre" />}
          </form.AppField>
          <form.AppField name="slug">
            {(field) => (
              <field.TextField
                label="Web address"
                description="Used in the product link, like /products/mustard-oil. Letters, numbers and dashes only."
              />
            )}
          </form.AppField>
          <form.AppField name="description">{(field) => <field.TextareaField label="Description" rows={6} />}</form.AppField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Images</CardTitle>
          <CardDescription>The first image is shown in lists and search results.</CardDescription>
        </CardHeader>
        <CardContent>
          <form.AppField name="images">
            {(field) => <field.ImageField label="Product images" multiple maxImages={MAX_PRODUCT_IMAGES} />}
          </form.AppField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Price and stock</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <form.AppField name="price">
            {(field) => <field.NumberField label={`Price${currency}`} min={0} step="0.01" />}
          </form.AppField>
          <form.AppField name="comparePrice">
            {(field) => (
              <field.NumberField
                label={`Compare price${currency}`}
                min={0}
                step="0.01"
                description="Optional. The old price, shown crossed out to mark a discount."
              />
            )}
          </form.AppField>
          <form.Subscribe selector={(state) => state.values.variants}>
            {(variants) =>
              variants.length > 0 ? (
                <p className="text-muted-foreground text-sm sm:col-span-2">
                  Stock comes from the variants below: {formatNumber(variants.reduce((sum, v) => sum + (v.stock || 0), 0))}{' '}
                  in total.
                </p>
              ) : (
                <form.AppField name="stock">
                  {(field) => <field.NumberField label="Stock" min={0} step={1} inputMode="numeric" />}
                </form.AppField>
              )
            }
          </form.Subscribe>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Category</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <form.AppField name="categoryId" listeners={{ onChange: () => form.setFieldValue('subcategoryId', '') }}>
            {(field) =>
              categoryOptions.length > 0 ? (
                <field.SelectField label="Category" options={categoryOptions} placeholder="Choose a category" />
              ) : (
                <p className="text-muted-foreground text-sm">
                  You have no categories yet.{' '}
                  <Link to="/admin/categories/$id" params={{ id: 'new' }} className="text-primary underline">
                    Create one first
                  </Link>
                  .
                </p>
              )
            }
          </form.AppField>
          <form.Subscribe selector={(state) => state.values.categoryId}>
            {(categoryId) => {
              const subcategories = categories.find((category) => category.id === categoryId)?.subcategories ?? []
              if (subcategories.length === 0) return null
              return (
                <form.AppField name="subcategoryId">
                  {(field) => (
                    <field.SelectField
                      label="Subcategory"
                      placeholder="No subcategory"
                      options={[
                        { value: '', label: 'No subcategory' },
                        ...subcategories.map((sub) => ({ value: sub.id, label: sub.name })),
                      ]}
                    />
                  )}
                </form.AppField>
              )
            }}
          </form.Subscribe>
        </CardContent>
      </Card>

      <form.Field name="variants" mode="array">
        {(variants) => (
          <Card>
            <CardHeader>
              <CardTitle>Variants</CardTitle>
              <CardDescription>Options like size or colour. The extra price is added to the product price.</CardDescription>
              <CardAction>
                <Button type="button" variant="outline" size="sm" onClick={() => variants.pushValue(emptyVariant)}>
                  <HugeiconsIcon icon={Add01Icon} />
                  Add variant
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent className="space-y-4">
              {variants.state.value.length === 0 && (
                <p className="text-muted-foreground text-sm">This product has no variants.</p>
              )}
              {variants.state.value.map((variant, index) => (
                <div key={variant.id || `new-${index}`} className="rounded-lg border p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="font-medium text-sm">Variant {index + 1}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => variants.removeValue(index)}
                      aria-label={`Remove variant ${index + 1}`}
                    >
                      <HugeiconsIcon icon={Delete02Icon} />
                    </Button>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <form.AppField name={`variants[${index}].name`}>
                      {(field) => <field.TextField label="Option" placeholder="e.g. Size" />}
                    </form.AppField>
                    <form.AppField name={`variants[${index}].value`}>
                      {(field) => <field.TextField label="Choice" placeholder="e.g. Large" />}
                    </form.AppField>
                    <form.AppField name={`variants[${index}].price`}>
                      {(field) => <field.NumberField label={`Extra price${currency}`} min={0} step="0.01" />}
                    </form.AppField>
                    <form.AppField name={`variants[${index}].stock`}>
                      {(field) => <field.NumberField label="Stock" min={0} step={1} inputMode="numeric" />}
                    </form.AppField>
                    <form.AppField name={`variants[${index}].sku`}>
                      {(field) => <field.TextField label="SKU" description="Optional stock code" />}
                    </form.AppField>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </form.Field>

      <Card>
        <CardHeader>
          <CardTitle>Visibility</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form.AppField name="active">
            {(field) => <field.SwitchField label="Active" description="Inactive products are hidden from the store." />}
          </form.AppField>
          <form.AppField name="featured">
            {(field) => <field.SwitchField label="Featured" description="Show this product in featured sections." />}
          </form.AppField>
        </CardContent>
      </Card>

      <div className="sticky bottom-0 z-10 -mx-4 flex items-center justify-end gap-3 border-t bg-background/95 px-4 py-3 backdrop-blur">
        <form.Subscribe selector={(state) => state.isDirty}>
          {(isDirty) => isDirty && <span className="mr-auto text-muted-foreground text-sm">Unsaved changes</span>}
        </form.Subscribe>
        <Link to="/admin/products" className={buttonVariants({ variant: 'outline' })}>
          Cancel
        </Link>
        <form.AppForm>
          <form.SubmitButton
            className="min-w-32"
            label={product ? 'Save changes' : 'Create product'}
            pendingLabel="Saving…"
          />
        </form.AppForm>
      </div>
    </form>
  )
}
