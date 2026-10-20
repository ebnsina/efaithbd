import { useSuspenseQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAppForm } from '@/components/form'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { siteSettingsQuery } from '@/features/settings/queries'
import type { listCoupons } from './coupons.functions'
import { dayIn } from './dates'
import { useSaveCoupon } from './queries'
import { type CouponInput, couponSchema } from './schemas'

export type Coupon = Awaited<ReturnType<typeof listCoupons>>['rows'][number]

const typeOptions = [
  { value: 'PERCENTAGE', label: 'Percentage off' },
  { value: 'FIXED', label: 'Fixed amount off' },
]

// `coupon` null = closed, 'new' = create, otherwise edit
export function CouponDialog({ coupon, onClose }: { coupon: Coupon | 'new' | null; onClose: () => void }) {
  return (
    <Dialog open={!!coupon} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-xl">
        {coupon && <CouponForm key={coupon === 'new' ? 'new' : coupon.id} coupon={coupon} onSaved={onClose} />}
      </DialogContent>
    </Dialog>
  )
}

function CouponForm({ coupon, onSaved }: { coupon: Coupon | 'new'; onSaved: () => void }) {
  const { data: settings } = useSuspenseQuery(siteSettingsQuery)
  const timeZone = settings?.timezone ?? 'Asia/Dhaka'
  const symbol = settings?.currencySymbol ?? ''
  const save = useSaveCoupon()
  const editing = coupon !== 'new' ? coupon : null
  const today = dayIn(new Date(), timeZone)

  const defaultValues: CouponInput = editing
    ? {
        code: editing.code,
        description: editing.description ?? '',
        type: editing.type,
        value: editing.value,
        minPurchase: editing.minPurchase,
        maxDiscount: editing.maxDiscount,
        usageLimit: editing.usageLimit,
        validFrom: dayIn(editing.validFrom, timeZone),
        validTo: dayIn(editing.validTo, timeZone),
        active: editing.active,
      }
    : {
        code: '',
        description: '',
        type: 'PERCENTAGE',
        value: null,
        minPurchase: null,
        maxDiscount: null,
        usageLimit: null,
        validFrom: today,
        validTo: dayIn(Date.now() + 30 * 86_400_000, timeZone),
        active: true,
      }

  const form = useAppForm({
    defaultValues,
    validators: { onSubmit: couponSchema },
    onSubmit: async ({ value, formApi }) => {
      try {
        const result = await save.mutateAsync({
          id: editing?.id,
          coupon: value,
        })
        if (!result.ok) {
          formApi.setFieldMeta(result.field, (meta) => ({
            ...meta,
            errorMap: { ...meta.errorMap, onSubmit: { message: result.error } },
          }))
          return
        }
        toast.success(editing ? 'Coupon saved' : 'Coupon created')
        onSaved()
      } catch {
        toast.error('Could not save this coupon. Please try again.')
      }
    },
  })

  return (
    <>
      <DialogHeader>
        <DialogTitle>{editing ? `Edit ${editing.code}` : 'New coupon'}</DialogTitle>
        <DialogDescription>Customers enter the code at checkout to get the discount.</DialogDescription>
      </DialogHeader>
      <form
        method="post"
        noValidate
        className="grid gap-4 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
      >
        <form.AppField name="code">
          {(field) => (
            <field.TextField
              label="Code"
              placeholder="EID2026"
              autoCapitalize="characters"
              className="uppercase"
              description="Not case sensitive"
            />
          )}
        </form.AppField>
        <form.AppField name="type">
          {(field) => <field.SelectField label="Discount type" options={typeOptions} />}
        </form.AppField>
        <div className="sm:col-span-2">
          <form.AppField name="description">
            {(field) => <field.TextareaField label="Description (optional)" rows={2} placeholder="Eid sale, 10% off" />}
          </form.AppField>
        </div>
        <form.Subscribe selector={(state) => state.values.type}>
          {(type) => (
            <>
              <div className={type === 'FIXED' ? 'sm:col-span-2' : undefined}>
                <form.AppField name="value">
                  {(field) => (
                    <field.NumberField
                      label={type === 'PERCENTAGE' ? 'Discount (%)' : `Discount (${symbol})`}
                      min={0}
                      max={type === 'PERCENTAGE' ? 100 : undefined}
                      step="any"
                    />
                  )}
                </form.AppField>
              </div>
              {type === 'PERCENTAGE' && (
                <form.AppField name="maxDiscount">
                  {(field) => (
                    <field.NumberField
                      label={`Largest discount (${symbol})`}
                      description="Leave empty for no cap"
                      min={0}
                      step="any"
                    />
                  )}
                </form.AppField>
              )}
            </>
          )}
        </form.Subscribe>
        <form.AppField name="minPurchase">
          {(field) => (
            <field.NumberField
              label={`Minimum order (${symbol})`}
              description="Leave empty for no minimum"
              min={0}
              step="any"
            />
          )}
        </form.AppField>
        <form.AppField name="usageLimit">
          {(field) => (
            <field.NumberField
              label="Times it can be used"
              description={editing ? `Used ${editing.usageCount} times so far` : 'Leave empty for no limit'}
              min={1}
              step={1}
              inputMode="numeric"
            />
          )}
        </form.AppField>
        <form.AppField name="validFrom">{(field) => <field.TextField label="Starts on" type="date" />}</form.AppField>
        <form.AppField name="validTo">
          {(field) => <field.TextField label="Ends on" type="date" description="Valid until the end of this day" />}
        </form.AppField>
        <div className="sm:col-span-2">
          <form.AppField name="active">
            {(field) => <field.SwitchField label="Active" description="Turn off to pause the coupon without deleting it" />}
          </form.AppField>
        </div>
        <DialogFooter className="sm:col-span-2">
          <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
          <form.AppForm>
            <div className="sm:w-36">
              <form.SubmitButton label={editing ? 'Save' : 'Create coupon'} pendingLabel="Saving…" />
            </div>
          </form.AppForm>
        </DialogFooter>
      </form>
    </>
  )
}
