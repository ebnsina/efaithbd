import { Alert02Icon, CheckmarkCircle02Icon, ShoppingCart01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useSelector } from '@tanstack/react-form'
import { useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useAppForm } from '@/components/form'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { siteSettingsQuery } from '@/features/settings/queries'
import { useMoney } from '@/lib/format'
import type { CartItem } from '@/lib/store'
import { checkoutKeys, checkoutQuoteQuery, useCheckCoupon, usePlaceOrder } from './queries'
import { type CheckoutForm as CheckoutValues, checkoutFormSchema } from './schemas'

type User = { name: string; phone: string | null } | null

export function CheckoutForm({ items, user, onPlaced }: { items: CartItem[]; user: User; onPlaced: () => void }) {
  const money = useMoney()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: settings } = useSuspenseQuery(siteSettingsQuery)
  const placeOrder = usePlaceOrder()
  const checkCoupon = useCheckCoupon()
  const [couponInput, setCouponInput] = useState('')
  const [couponMessage, setCouponMessage] = useState('')
  const [submitError, setSubmitError] = useState('')

  const lines = items.map(({ productId, variantId, quantity }) => ({ productId, variantId, quantity }))

  const form = useAppForm({
    defaultValues: {
      customerName: user?.name ?? '',
      customerPhone: user?.phone ?? '',
      customerAddress: '',
      shippingMethodId: '',
      paymentMethod: 'COD',
      bkashNumber: '',
      bkashTrxId: '',
      couponCode: '',
    } as CheckoutValues,
    validators: { onSubmit: checkoutFormSchema, onBlur: checkoutFormSchema },
    onSubmit: async ({ value }) => {
      setSubmitError('')
      try {
        const result = await placeOrder.mutateAsync({ data: { form: value, items: lines } })
        if (!result.ok) {
          setSubmitError(result.error)
          return queryClient.invalidateQueries({ queryKey: checkoutKeys.all })
        }
        await navigate({
          to: '/orders/$orderNumber',
          params: { orderNumber: result.orderNumber },
          search: { placed: true },
        })
        onPlaced()
      } catch {
        setSubmitError("We couldn't place your order. Please check your connection and try again.")
      }
    },
  })

  const couponCode = useSelector(form.store, (state) => state.values.couponCode)
  const shippingMethodId = useSelector(form.store, (state) => state.values.shippingMethodId)
  const paymentMethod = useSelector(form.store, (state) => state.values.paymentMethod)
  const quote = useQuery(checkoutQuoteQuery({ items: lines, couponCode }))

  const options = quote.data?.shippingOptions ?? []
  const selectedShipping = options.find((option) => option.id === shippingMethodId)

  // Pick the first delivery option the cart qualifies for, and re-pick if the cart changes so it no longer fits
  useEffect(() => {
    if (quote.data && !quote.data.shippingOptions.some((option) => option.id === shippingMethodId)) {
      form.setFieldValue('shippingMethodId', quote.data.shippingOptions[0]?.id ?? '')
    }
  }, [quote.data, shippingMethodId, form])

  const applyCoupon = () => {
    const code = couponInput.trim().toUpperCase()
    if (!code) return
    setCouponMessage('')
    checkCoupon.mutate(
      { items: lines, couponCode: code },
      {
        onSuccess: (result) => {
          if (result.couponError || !result.coupon) return setCouponMessage(result.couponError ?? "This coupon code isn't valid")
          form.setFieldValue('couponCode', result.coupon.code)
          setCouponInput('')
        },
        onError: () => setCouponMessage("We couldn't check this coupon. Please try again."),
      }
    )
  }

  const removeCoupon = () => {
    form.setFieldValue('couponCode', '')
    setCouponMessage('')
  }

  const total = quote.data ? quote.data.subtotal - quote.data.discount + (selectedShipping?.cost ?? 0) : 0
  const blocked = !!quote.data?.problems.length

  return (
    <form
      method="post"
      noValidate
      className="grid gap-6 lg:grid-cols-5"
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
    >
      <div className="space-y-6 lg:col-span-3">
        {!user && (
          <Card size="sm" className="bg-muted/50">
            <CardContent className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
              <p className="text-sm">
                <span className="font-medium">No account needed.</span>{' '}
                <span className="text-muted-foreground">You can track your order later with your phone number.</span>
              </p>
              <Link
                to="/login"
                search={{ redirect: '/checkout' }}
                className={buttonVariants({ variant: 'outline', size: 'sm' })}
              >
                Sign in
              </Link>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Delivery details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form.AppField name="customerName">
              {(field) => <field.TextField label="Full name" autoComplete="name" />}
            </form.AppField>
            <form.AppField name="customerPhone">
              {(field) => (
                <field.TextField
                  label="Mobile number"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  placeholder="01XXXXXXXXX"
                  maxLength={11}
                  description="We'll call this number to confirm your order"
                />
              )}
            </form.AppField>
            <form.AppField name="customerAddress">
              {(field) => (
                <field.TextareaField
                  label="Full address"
                  autoComplete="street-address"
                  rows={3}
                  placeholder="House, road, area, city"
                />
              )}
            </form.AppField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Delivery option</CardTitle>
          </CardHeader>
          <CardContent>
            {quote.isPending ? (
              <div className="space-y-2">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </div>
            ) : quote.isError ? (
              <QuoteError onRetry={() => quote.refetch()} />
            ) : options.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                We can't deliver this order right now. Please contact us and we'll sort it out.
              </p>
            ) : (
              <form.AppField name="shippingMethodId">
                {(field) => (
                  <FieldSet>
                    <FieldLegend className="sr-only">Delivery option</FieldLegend>
                    <RadioGroup value={field.state.value} onValueChange={(value) => field.handleChange(value as string)}>
                      {options.map((option) => (
                        <FieldLabel key={option.id} htmlFor={`ship-${option.id}`}>
                          <Field orientation="horizontal">
                            <RadioGroupItem value={option.id} id={`ship-${option.id}`} />
                            <FieldContent>
                              <FieldTitle>{option.name}</FieldTitle>
                              {option.description && <FieldDescription>{option.description}</FieldDescription>}
                            </FieldContent>
                            <span className="font-medium text-sm tabular-nums">{money(option.cost)}</span>
                          </Field>
                        </FieldLabel>
                      ))}
                    </RadioGroup>
                    <FieldError errors={field.state.meta.errors as { message?: string }[]} />
                  </FieldSet>
                )}
              </form.AppField>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form.AppField name="paymentMethod">
              {(field) => (
                <FieldSet>
                  <FieldLegend className="sr-only">Payment method</FieldLegend>
                  <RadioGroup
                    value={field.state.value}
                    onValueChange={(value) => field.handleChange(value as CheckoutValues['paymentMethod'])}
                  >
                    <FieldLabel htmlFor="pay-cod">
                      <Field orientation="horizontal">
                        <RadioGroupItem value="COD" id="pay-cod" />
                        <FieldContent>
                          <FieldTitle>Cash on delivery</FieldTitle>
                          <FieldDescription>Pay when your order arrives</FieldDescription>
                        </FieldContent>
                      </Field>
                    </FieldLabel>
                    {settings?.bkashNumber && (
                      <FieldLabel htmlFor="pay-bkash">
                        <Field orientation="horizontal">
                          <RadioGroupItem value="BKASH" id="pay-bkash" />
                          <FieldContent>
                            <FieldTitle>bKash</FieldTitle>
                            <FieldDescription>Send money first, then enter the transaction ID</FieldDescription>
                          </FieldContent>
                        </Field>
                      </FieldLabel>
                    )}
                  </RadioGroup>
                </FieldSet>
              )}
            </form.AppField>

            {paymentMethod === 'BKASH' && settings?.bkashNumber && (
              <div className="space-y-4 rounded-lg border bg-muted/40 p-4">
                <div>
                  <p className="text-muted-foreground text-sm">Send money to this bKash number</p>
                  <p className="font-semibold text-xl tabular-nums tracking-wide">{settings.bkashNumber}</p>
                  {settings.bkashNote && (
                    <p className="mt-2 whitespace-pre-line text-muted-foreground text-sm">{settings.bkashNote}</p>
                  )}
                  {quote.data && (
                    <p className="mt-2 text-sm">
                      Amount to send: <span className="font-semibold tabular-nums">{money(total)}</span>
                    </p>
                  )}
                </div>
                <form.AppField name="bkashNumber">
                  {(field) => (
                    <field.TextField
                      label="Your bKash number"
                      type="tel"
                      inputMode="numeric"
                      placeholder="01XXXXXXXXX"
                      maxLength={11}
                    />
                  )}
                </form.AppField>
                <form.AppField name="bkashTrxId">
                  {(field) => (
                    <field.TextField
                      label="Transaction ID"
                      autoCapitalize="characters"
                      placeholder="e.g. 9BC4D7XKQ1"
                      description="You'll find it in the bKash confirmation message"
                    />
                  )}
                </form.AppField>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2">
        <Card className="lg:sticky lg:top-20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={ShoppingCart01Icon} className="size-5" />
              Order summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {quote.isPending ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : quote.isError ? (
              <QuoteError onRetry={() => quote.refetch()} />
            ) : (
              <>
                {blocked && (
                  <div role="alert" className="space-y-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm">
                    {quote.data.problems.map((problem) => (
                      <p key={problem} className="flex gap-2 text-destructive">
                        <HugeiconsIcon icon={Alert02Icon} className="mt-0.5 size-4 shrink-0" />
                        {problem}
                      </p>
                    ))}
                    <Link to="/cart" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                      Update cart
                    </Link>
                  </div>
                )}

                <ul className="max-h-72 space-y-3 overflow-y-auto">
                  {quote.data.lines.map((line) => (
                    <li key={`${line.productId}-${line.variantId ?? ''}`} className="flex gap-3 text-sm">
                      {line.image ? (
                        <img src={line.image} alt="" className="size-12 shrink-0 rounded-md bg-muted object-cover" />
                      ) : (
                        <div className="size-12 shrink-0 rounded-md bg-muted" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 font-medium">{line.name}</p>
                        <p className="text-muted-foreground text-xs">
                          {line.variantLabel && `${line.variantLabel} · `}
                          {line.quantity} × {money(line.unitPrice)}
                        </p>
                      </div>
                      <span className="font-medium tabular-nums">{money(line.total)}</span>
                    </li>
                  ))}
                </ul>

                {quote.data.couponsEnabled && (
                  <>
                    <Separator />
                    {couponCode ? (
                      <div className="flex items-start justify-between gap-2 rounded-lg border bg-muted/40 p-3 text-sm">
                        <div>
                          <p className="flex items-center gap-1.5 font-medium">
                            <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4 text-primary" />
                            <Badge variant="secondary">{couponCode}</Badge>
                          </p>
                          {quote.data.couponError ? (
                            <p className="mt-1 text-destructive">{quote.data.couponError}</p>
                          ) : (
                            quote.data.coupon?.description && (
                              <p className="mt-1 text-muted-foreground">{quote.data.coupon.description}</p>
                            )
                          )}
                        </div>
                        <Button type="button" variant="ghost" size="sm" onClick={removeCoupon}>
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <Field data-invalid={!!couponMessage}>
                        <FieldLabel htmlFor="coupon">Coupon code</FieldLabel>
                        <div className="flex gap-2">
                          <Input
                            id="coupon"
                            value={couponInput}
                            onChange={(e) => setCouponInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                applyCoupon()
                              }
                            }}
                            autoCapitalize="characters"
                            aria-invalid={!!couponMessage}
                          />
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={applyCoupon}
                            disabled={checkCoupon.isPending || !couponInput.trim()}
                          >
                            {checkCoupon.isPending && <Spinner />}
                            Apply
                          </Button>
                        </div>
                        {couponMessage && <FieldError>{couponMessage}</FieldError>}
                      </Field>
                    )}
                  </>
                )}

                <Separator />
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Subtotal</dt>
                    <dd className="tabular-nums">{money(quote.data.subtotal)}</dd>
                  </div>
                  {quote.data.discount > 0 && (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Discount</dt>
                      <dd className="tabular-nums">−{money(quote.data.discount)}</dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Delivery</dt>
                    <dd className="tabular-nums">{selectedShipping ? money(selectedShipping.cost) : '—'}</dd>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-base">
                    <dt>Total</dt>
                    <dd className="tabular-nums">{money(total)}</dd>
                  </div>
                </dl>
              </>
            )}

            {submitError && (
              <div role="alert" className="flex gap-2 rounded-lg bg-destructive/10 p-3 text-destructive text-sm">
                <HugeiconsIcon icon={Alert02Icon} className="mt-0.5 size-4 shrink-0" />
                {submitError}
              </div>
            )}

            <form.Subscribe selector={(state) => state.isSubmitting}>
              {(isSubmitting) => (
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting || !quote.data || blocked || options.length === 0}
                >
                  {isSubmitting && <Spinner />}
                  {isSubmitting ? 'Placing your order…' : 'Place order'}
                </Button>
              )}
            </form.Subscribe>
            <p className="text-center text-muted-foreground text-xs">
              Prices and stock are checked again when you place the order.
            </p>
          </CardContent>
        </Card>
      </div>
    </form>
  )
}

function QuoteError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-start gap-2 text-sm">
      <p className="text-muted-foreground">We couldn't load your order total. Please check your connection.</p>
      <Button type="button" variant="outline" size="sm" onClick={onRetry}>
        Try again
      </Button>
    </div>
  )
}
