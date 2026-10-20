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
import { type ShippingMethod, useSaveShippingMethod } from './queries'
import { type ShippingMethodInput, shippingMethodSchema } from './schemas'

// `method` null = closed, 'new' = create, otherwise edit
export function ShippingDialog({ method, onClose }: { method: ShippingMethod | 'new' | null; onClose: () => void }) {
  return (
    <Dialog open={!!method} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg">
        {method && <ShippingForm key={method === 'new' ? 'new' : method.id} method={method} onSaved={onClose} />}
      </DialogContent>
    </Dialog>
  )
}

function ShippingForm({ method, onSaved }: { method: ShippingMethod | 'new'; onSaved: () => void }) {
  const { data: settings } = useSuspenseQuery(siteSettingsQuery)
  const symbol = settings?.currencySymbol ?? ''
  const save = useSaveShippingMethod()
  const editing = method !== 'new' ? method : null

  const defaultValues: ShippingMethodInput = editing
    ? { ...editing, description: editing.description ?? '' }
    : {
        name: '',
        description: '',
        cost: null,
        minOrder: null,
        maxOrder: null,
        active: true,
      }

  const form = useAppForm({
    defaultValues,
    validators: { onSubmit: shippingMethodSchema },
    onSubmit: async ({ value }) => {
      try {
        await save.mutateAsync({ id: editing?.id, method: value })
        toast.success(editing ? 'Shipping method saved' : 'Shipping method added')
        onSaved()
      } catch {
        toast.error('Could not save this shipping method. Please try again.')
      }
    },
  })

  return (
    <>
      <DialogHeader>
        <DialogTitle>{editing ? `Edit ${editing.name}` : 'New shipping method'}</DialogTitle>
        <DialogDescription>Customers pick one of these at checkout.</DialogDescription>
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
        <form.AppField name="name">{(field) => <field.TextField label="Name" placeholder="Inside Dhaka" />}</form.AppField>
        <form.AppField name="cost">
          {(field) => <field.NumberField label={`Delivery charge (${symbol})`} min={0} step="any" />}
        </form.AppField>
        <div className="sm:col-span-2">
          <form.AppField name="description">
            {(field) => <field.TextareaField label="Description (optional)" rows={2} placeholder="Delivered in 1–2 days" />}
          </form.AppField>
        </div>
        <form.AppField name="minOrder">
          {(field) => (
            <field.NumberField
              label={`Smallest order (${symbol})`}
              description="Leave empty for no minimum"
              min={0}
              step="any"
            />
          )}
        </form.AppField>
        <form.AppField name="maxOrder">
          {(field) => (
            <field.NumberField
              label={`Largest order (${symbol})`}
              description="Leave empty for no maximum"
              min={0}
              step="any"
            />
          )}
        </form.AppField>
        <div className="sm:col-span-2">
          <form.AppField name="active">
            {(field) => <field.SwitchField label="Active" description="Turn off to hide it from checkout" />}
          </form.AppField>
        </div>
        <DialogFooter className="sm:col-span-2">
          <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
          <form.AppForm>
            <div className="sm:w-36">
              <form.SubmitButton label={editing ? 'Save' : 'Add'} pendingLabel="Saving…" />
            </div>
          </form.AppForm>
        </DialogFooter>
      </form>
    </>
  )
}
