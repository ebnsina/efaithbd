import { Add01Icon, ArrowLeft01Icon, Cancel01Icon, Delete02Icon, Search01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { revalidateLogic, useSelector } from '@tanstack/react-form'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { type ReactNode, useEffect, useMemo, useState } from 'react'
import { useAppForm } from '@/components/form'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldError } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import type { OrderCustomerOption, OrderProductOption } from '@/features/admin-orders/admin-orders.functions'
import { orderCustomersQuery, orderProductsQuery, useCreateOrder } from '@/features/admin-orders/queries'
import { type NewOrderValues, newOrderSchema } from '@/features/admin-orders/schemas'
import { orderStatusLabels, paymentMethodLabels, paymentStatusLabels, toOptions } from '@/features/admin-orders/status'
import { checkoutKeys, checkoutQuoteQuery } from '@/features/checkout/queries'
import { applyServerErrors, LeaveGuard } from '@/features/products/form-helpers'
import { formatNumber, useMoney } from '@/lib/format'

export const Route = createFileRoute('/admin/orders/new')({
  head: () => ({ meta: [{ title: 'New order' }] }),
  component: NewOrderPage,
})

const defaultValues: NewOrderValues = {
  userId: '',
  customerName: '',
  customerPhone: '',
  customerAddress: '',
  notes: '',
  items: [],
  shippingMethodId: '',
  couponCode: '',
  paymentMethod: 'COD',
  bkashNumber: '',
  bkashTrxId: '',
  paymentStatus: 'PENDING',
  orderStatus: 'CONFIRMED',
}

function useDebounced<T>(value: T, ms = 300) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), ms)
    return () => clearTimeout(timer)
  }, [value, ms])
  return debounced
}

const variantText = (variant: { name: string; value: string }) =>
  variant.name === variant.value ? variant.value : `${variant.name}: ${variant.value}`

function NewOrderPage() {
  const money = useMoney()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const create = useCreateOrder()
  const [products, setProducts] = useState<Record<string, OrderProductOption>>({})
  const [customer, setCustomer] = useState<OrderCustomerOption | null>(null)
  const [submitError, setSubmitError] = useState('')

  const form = useAppForm({
    defaultValues,
    validationLogic: revalidateLogic(),
    validators: { onDynamic: newOrderSchema },
    listeners: { onChange: () => setSubmitError('') },
    onSubmit: async ({ value, formApi }) => {
      setSubmitError('')
      const result = await create.mutateAsync(value).catch(() => null)
      if (!result) return
      if (!result.ok) {
        if (result.fieldErrors) applyServerErrors(formApi, result)
        else setSubmitError(result.error)
        return queryClient.invalidateQueries({ queryKey: checkoutKeys.all })
      }
      await navigate({ to: '/admin/orders', search: { order: result.id } })
    },
  })

  const items = useSelector(form.store, (state) => state.values.items)
  const couponCode = useSelector(form.store, (state) => state.values.couponCode)
  const shippingMethodId = useSelector(form.store, (state) => state.values.shippingMethodId)
  const paymentMethod = useSelector(form.store, (state) => state.values.paymentMethod)

  // Only complete rows are priced; the server works out every amount
  const quoteKey = useDebounced(
    JSON.stringify({
      items: items
        .filter((item) => Number.isInteger(item.quantity) && (item.quantity ?? 0) >= 1)
        .filter((item) => item.variantId || !products[item.productId]?.variants.length)
        .map((item) => ({ productId: item.productId, variantId: item.variantId || undefined, quantity: item.quantity })),
      couponCode: couponCode.trim().toUpperCase(),
      shippingMethodId,
    }),
  )
  const quoteInput = useMemo(() => JSON.parse(quoteKey), [quoteKey])
  const quote = useQuery({ ...checkoutQuoteQuery(quoteInput), enabled: quoteInput.items.length > 0 })
  const hasLines = quoteInput.items.length > 0

  useEffect(() => {
    if (quote.data && !quote.data.shippingOptions.some((option) => option.id === shippingMethodId)) {
      form.setFieldValue('shippingMethodId', quote.data.shippingOptions[0]?.id ?? '')
    }
  }, [quote.data, shippingMethodId, form])

  const addProduct = (product: OrderProductOption) => {
    setProducts((prev) => ({ ...prev, [product.id]: product }))
    const existing = items.findIndex((item) => item.productId === product.id && !product.variants.length)
    if (existing >= 0) {
      form.setFieldValue(`items[${existing}].quantity`, (items[existing].quantity ?? 0) + 1)
      return
    }
    const variant = product.variants.find((v) => v.stock > 0) ?? product.variants[0]
    form.pushFieldValue('items', { productId: product.id, variantId: variant?.id ?? '', quantity: 1 })
  }

  const pickCustomer = (picked: OrderCustomerOption) => {
    setCustomer(picked)
    form.setFieldValue('userId', picked.id)
    form.setFieldValue('customerName', picked.name)
    if (picked.phone) form.setFieldValue('customerPhone', picked.phone)
    const address = picked.orders[0]?.customerAddress
    if (address && !form.getFieldValue('customerAddress')) form.setFieldValue('customerAddress', address)
  }

  const clearCustomer = () => {
    setCustomer(null)
    form.setFieldValue('userId', '')
  }

  const shippingOptions = (quote.data?.shippingOptions ?? []).map((option) => ({
    value: option.id,
    label: `${option.name} · ${money(option.cost)}`,
  }))

  return (
    <form
      method="post"
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
      className="mx-auto max-w-6xl space-y-6"
    >
      <LeaveGuard isDirty={() => form.state.isDirty && !form.state.isSubmitting} />
      <div className="flex items-start gap-3">
        <Link to="/admin/orders" className={buttonVariants({ variant: 'ghost', size: 'icon' })} aria-label="Back">
          <HugeiconsIcon icon={ArrowLeft01Icon} />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="font-semibold text-2xl tracking-tight">New order</h1>
          <p className="mt-1 text-muted-foreground">For orders taken by phone or WhatsApp</p>
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-5">
        <div className="min-w-0 space-y-6 lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
              <CardDescription>
                Pick an existing customer to link the order to their account, or just type the details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {customer ? (
                <div className="flex items-center gap-3 rounded-lg border bg-muted/50 p-3">
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{customer.name}</div>
                    <div className="truncate text-muted-foreground text-xs">
                      {[customer.email, customer.phone].filter(Boolean).join(' · ')}
                    </div>
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={clearCustomer}>
                    <HugeiconsIcon icon={Cancel01Icon} />
                    Unlink
                  </Button>
                </div>
              ) : (
                <CustomerPicker onPick={pickCustomer} />
              )}
              <form.Subscribe selector={(state) => state.fieldMeta.userId?.errors}>
                {(errors) => <FieldError errors={errors as { message?: string }[] | undefined} />}
              </form.Subscribe>
              <form.AppField name="customerName">{(field) => <field.TextField label="Name" />}</form.AppField>
              <form.AppField name="customerPhone">
                {(field) => (
                  <field.TextField
                    label="Mobile number"
                    type="tel"
                    inputMode="numeric"
                    placeholder="01XXXXXXXXX"
                    maxLength={11}
                  />
                )}
              </form.AppField>
              <form.AppField name="customerAddress">
                {(field) => <field.TextareaField label="Delivery address" rows={3} placeholder="House, road, area, city" />}
              </form.AppField>
              <form.AppField name="notes">
                {(field) => <field.TextareaField label="Note" rows={2} description="Optional. Only your team sees this." />}
              </form.AppField>
            </CardContent>
          </Card>

          <form.Field name="items" mode="array">
            {(itemsField) => (
              <Card>
                <CardHeader>
                  <CardTitle>Items</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ProductPicker onPick={addProduct} />
                  {itemsField.state.value.length === 0 && (
                    <p className="rounded-lg border border-dashed p-6 text-center text-muted-foreground text-sm">
                      No items yet. Search for a product above to add it.
                    </p>
                  )}
                  {itemsField.state.value.map((item, index) => {
                    const product = products[item.productId]
                    const variant = product?.variants.find((v) => v.id === item.variantId)
                    const stock = variant ? variant.stock : product?.stock
                    const price = (product?.price ?? 0) + (variant?.price ?? 0)
                    return (
                      <div key={`${item.productId}-${index}`} className="space-y-3 rounded-lg border p-3">
                        <div className="flex items-start gap-3">
                          {product?.images[0] ? (
                            <img src={product.images[0]} alt="" className="size-12 shrink-0 rounded-md object-cover" />
                          ) : (
                            <div className="size-12 shrink-0 rounded-md bg-muted" />
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="font-medium">{product?.name ?? 'Product'}</div>
                            <div className="text-muted-foreground text-xs">
                              {money(price)} each
                              {stock !== undefined && ` · ${stock > 0 ? `${formatNumber(stock)} in stock` : 'out of stock'}`}
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => itemsField.removeValue(index)}
                            aria-label={`Remove ${product?.name ?? 'item'}`}
                          >
                            <HugeiconsIcon icon={Delete02Icon} />
                          </Button>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-[1fr_8rem]">
                          {product && product.variants.length > 0 ? (
                            <form.AppField name={`items[${index}].variantId`}>
                              {(field) => (
                                <field.SelectField
                                  label="Option"
                                  placeholder="Choose an option"
                                  options={product.variants.map((v) => ({
                                    value: v.id,
                                    label: `${variantText(v)} · ${v.stock > 0 ? `${formatNumber(v.stock)} left` : 'out of stock'}`,
                                  }))}
                                />
                              )}
                            </form.AppField>
                          ) : (
                            <div className="max-sm:hidden" />
                          )}
                          <form.AppField name={`items[${index}].quantity`}>
                            {(field) => <field.NumberField label="Quantity" min={1} step={1} inputMode="numeric" />}
                          </form.AppField>
                        </div>
                      </div>
                    )
                  })}
                  {itemsField.form.state.submissionAttempts > 0 && (
                    <FieldError errors={itemsField.state.meta.errors as { message?: string }[]} />
                  )}
                </CardContent>
              </Card>
            )}
          </form.Field>

          <Card>
            <CardHeader>
              <CardTitle>Delivery and payment</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <form.AppField name="shippingMethodId">
                {(field) => (
                  <field.SelectField
                    label="Delivery"
                    options={shippingOptions}
                    placeholder={hasLines ? 'Choose a delivery option' : 'Add items first'}
                  />
                )}
              </form.AppField>
              <div className="space-y-2">
                <form.AppField name="couponCode">
                  {(field) => (
                    <field.TextField
                      label="Coupon code"
                      placeholder="Optional"
                      className="uppercase placeholder:normal-case"
                    />
                  )}
                </form.AppField>
                {quote.data?.couponError && couponCode.trim() && (
                  <p className="text-destructive text-sm">{quote.data.couponError}</p>
                )}
                {quote.data?.coupon && <p className="text-muted-foreground text-sm">Coupon applied</p>}
              </div>
              <form.AppField name="paymentMethod">
                {(field) => <field.SelectField label="Payment method" options={toOptions(paymentMethodLabels)} />}
              </form.AppField>
              <form.AppField name="paymentStatus">
                {(field) => <field.SelectField label="Payment status" options={toOptions(paymentStatusLabels)} />}
              </form.AppField>
              {paymentMethod === 'BKASH' && (
                <>
                  <form.AppField name="bkashNumber">
                    {(field) => (
                      <field.TextField
                        label="bKash number"
                        type="tel"
                        inputMode="numeric"
                        placeholder="01XXXXXXXXX"
                        maxLength={11}
                      />
                    )}
                  </form.AppField>
                  <form.AppField name="bkashTrxId">
                    {(field) => <field.TextField label="Transaction ID" className="font-mono uppercase" />}
                  </form.AppField>
                </>
              )}
              <form.AppField name="orderStatus">
                {(field) => <field.SelectField label="Order status" options={toOptions(orderStatusLabels)} />}
              </form.AppField>
            </CardContent>
          </Card>
        </div>

        <Card className="lg:sticky lg:top-4 lg:col-span-2">
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {!hasLines ? (
              <p className="text-muted-foreground">Add items to see the total.</p>
            ) : quote.isPending ? (
              <div className="space-y-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-5 w-1/2" />
              </div>
            ) : quote.isError ? (
              <div className="space-y-2">
                <p className="text-muted-foreground">We couldn't work out the total. Please check your connection.</p>
                <Button type="button" variant="outline" size="sm" onClick={() => quote.refetch()}>
                  Try again
                </Button>
              </div>
            ) : (
              quote.data && (
                <>
                  <ul className="space-y-2">
                    {quote.data.lines.map((line) => (
                      <li key={`${line.productId}-${line.variantId ?? ''}`} className="flex justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate">{line.name}</div>
                          <div className="text-muted-foreground text-xs">
                            {line.variantLabel && `${line.variantLabel} · `}
                            {money(line.unitPrice)} × {line.quantity}
                          </div>
                        </div>
                        <span className="tabular-nums">{money(line.total)}</span>
                      </li>
                    ))}
                  </ul>
                  {quote.data.problems.length > 0 && (
                    <ul className="space-y-1 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-destructive">
                      {quote.data.problems.map((problem) => (
                        <li key={problem}>{problem}</li>
                      ))}
                    </ul>
                  )}
                  <Separator />
                  <SummaryRow label="Subtotal">{money(quote.data.subtotal)}</SummaryRow>
                  {quote.data.discount > 0 && (
                    <SummaryRow label={`Discount (${quote.data.coupon?.code})`}>−{money(quote.data.discount)}</SummaryRow>
                  )}
                  <SummaryRow label={quote.data.shipping ? `Delivery (${quote.data.shipping.name})` : 'Delivery'}>
                    {quote.data.shipping ? money(quote.data.shipping.cost) : 'Not available'}
                  </SummaryRow>
                  <Separator />
                  <SummaryRow label="Total">
                    <span className="font-semibold text-base">{money(quote.data.total)}</span>
                  </SummaryRow>
                </>
              )
            )}
            {submitError && (
              <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-destructive">
                {submitError}
              </p>
            )}
            <form.AppForm>
              <form.SubmitButton label="Create order" pendingLabel="Creating…" />
            </form.AppForm>
            <p className="text-muted-foreground text-xs">
              Creating the order takes the items out of stock and counts the coupon as used.
            </p>
          </CardContent>
        </Card>
      </div>
    </form>
  )
}

function SummaryRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right tabular-nums">{children}</span>
    </div>
  )
}

function SearchBox({
  label,
  placeholder,
  q,
  onChange,
  children,
}: {
  label: string
  placeholder: string
  q: string
  onChange: (q: string) => void
  children: ReactNode
}) {
  return (
    <div className="space-y-2">
      <div className="relative">
        <HugeiconsIcon
          icon={Search01Icon}
          className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          type="search"
          value={q}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
          placeholder={placeholder}
          aria-label={label}
          className="pl-8"
        />
      </div>
      {q.trim() && <div className="max-h-72 overflow-y-auto rounded-lg border">{children}</div>}
    </div>
  )
}

function SearchState({
  isPending,
  isError,
  isEmpty,
  emptyText,
  onRetry,
}: {
  isPending: boolean
  isError: boolean
  isEmpty: boolean
  emptyText: string
  onRetry: () => void
}) {
  if (isPending) {
    return (
      <div className="space-y-2 p-3">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-5 w-1/2" />
      </div>
    )
  }
  if (isError) {
    return (
      <div className="flex items-center justify-between gap-3 p-3 text-muted-foreground text-sm">
        Search didn't work. Check your connection.
        <Button type="button" variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      </div>
    )
  }
  return isEmpty ? <p className="p-3 text-muted-foreground text-sm">{emptyText}</p> : null
}

function CustomerPicker({ onPick }: { onPick: (customer: OrderCustomerOption) => void }) {
  const [q, setQ] = useState('')
  const search = useDebounced(q.trim())
  const customers = useQuery({ ...orderCustomersQuery(search), enabled: !!search })
  return (
    <SearchBox label="Find a customer" placeholder="Find a customer by name, phone or email" q={q} onChange={setQ}>
      <SearchState
        isPending={customers.isPending}
        isError={customers.isError}
        isEmpty={customers.data?.length === 0}
        emptyText="No customers match. Type the details below instead."
        onRetry={() => customers.refetch()}
      />
      <ul className="divide-y">
        {customers.data?.map((customer) => (
          <li key={customer.id}>
            <button
              type="button"
              onClick={() => {
                onPick(customer)
                setQ('')
              }}
              className="w-full px-3 py-2 text-left hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
            >
              <div className="font-medium text-sm">{customer.name}</div>
              <div className="text-muted-foreground text-xs">
                {[customer.phone, customer.email].filter(Boolean).join(' · ')}
              </div>
            </button>
          </li>
        ))}
      </ul>
    </SearchBox>
  )
}

function ProductPicker({ onPick }: { onPick: (product: OrderProductOption) => void }) {
  const money = useMoney()
  const [q, setQ] = useState('')
  const search = useDebounced(q.trim())
  const products = useQuery({ ...orderProductsQuery(search), enabled: !!search })
  return (
    <SearchBox label="Add a product" placeholder="Search products to add" q={q} onChange={setQ}>
      <SearchState
        isPending={products.isPending}
        isError={products.isError}
        isEmpty={products.data?.length === 0}
        emptyText="No products match your search."
        onRetry={() => products.refetch()}
      />
      <ul className="divide-y">
        {products.data?.map((product) => {
          const stock = product.variants.length ? product.variants.reduce((sum, v) => sum + v.stock, 0) : product.stock
          return (
            <li key={product.id}>
              <button
                type="button"
                onClick={() => {
                  onPick(product)
                  setQ('')
                }}
                className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
              >
                {product.images[0] ? (
                  <img src={product.images[0]} alt="" className="size-9 shrink-0 rounded-md object-cover" />
                ) : (
                  <div className="size-9 shrink-0 rounded-md bg-muted" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium text-sm">{product.name}</div>
                  <div className="text-muted-foreground text-xs">
                    {money(product.price)}
                    {product.variants.length > 0 && ` · ${product.variants.length} options`}
                    {` · ${stock > 0 ? `${formatNumber(stock)} in stock` : 'out of stock'}`}
                  </div>
                </div>
                <HugeiconsIcon icon={Add01Icon} className="size-4 shrink-0 text-muted-foreground" />
              </button>
            </li>
          )
        })}
      </ul>
    </SearchBox>
  )
}
