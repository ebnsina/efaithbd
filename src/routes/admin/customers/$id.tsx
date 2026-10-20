import { ArrowLeft01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { revalidateLogic } from '@tanstack/react-form'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, type ErrorComponentProps, Link, notFound, useNavigate, useRouter } from '@tanstack/react-router'
import { useMemo } from 'react'
import { useAppForm } from '@/components/form'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { orderStatusBadge, orderStatusLabels } from '@/features/admin-orders/status'
import type { AdminCustomerDetail } from '@/features/customers/customers.functions'
import { adminCustomerQuery, useSaveCustomer } from '@/features/customers/queries'
import {
  type CustomerFormValues,
  customerFormSchema,
  newCustomerSchema,
  roleLabels,
  roles,
} from '@/features/customers/schemas'
import { applyServerErrors, LeaveGuard } from '@/features/products/form-helpers'
import { formatDate, formatNumber, useMoney } from '@/lib/format'

export const Route = createFileRoute('/admin/customers/$id')({
  loader: async ({ context: { queryClient }, params: { id } }) => {
    if (id === 'new') return
    if (!(await queryClient.ensureQueryData(adminCustomerQuery(id)))) throw notFound()
  },
  head: ({ params }) => ({ meta: [{ title: params.id === 'new' ? 'New customer' : 'Customer' }] }),
  component: CustomerPage,
  notFoundComponent: () => <Message text="This account could not be found. It may have been deleted." />,
  errorComponent: LoadError,
})

function Message({ text, children }: { text: string; children?: React.ReactNode }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
      <p className="text-muted-foreground">{text}</p>
      <div className="flex gap-2">
        {children}
        <Link to="/admin/customers" className={buttonVariants({ variant: 'outline' })}>
          Back to customers
        </Link>
      </div>
    </div>
  )
}

function LoadError({ reset }: ErrorComponentProps) {
  const router = useRouter()
  return (
    <Message text="This page could not be loaded. Check your connection and try again.">
      <Button
        onClick={() => {
          reset()
          router.invalidate()
        }}
      >
        Try again
      </Button>
    </Message>
  )
}

function CustomerPage() {
  const { id } = Route.useParams()
  return id === 'new' ? <CustomerForm customer={null} /> : <EditCustomer id={id} />
}

function EditCustomer({ id }: { id: string }) {
  const { data: customer } = useSuspenseQuery(adminCustomerQuery(id))
  if (!customer) throw notFound()
  return <CustomerForm customer={customer} />
}

const toFormValues = (customer: AdminCustomerDetail | null): CustomerFormValues => ({
  name: customer?.name ?? '',
  email: customer?.email ?? '',
  phone: customer?.phone ?? '',
  role: customer?.role ?? 'CUSTOMER',
  password: '',
})

const roleOptions = roles.map((role) => ({ value: role, label: roleLabels[role] }))

function CustomerForm({ customer }: { customer: AdminCustomerDetail | null }) {
  const navigate = useNavigate()
  const save = useSaveCustomer(customer?.id ?? null)
  const defaultValues = useMemo(() => toFormValues(customer), [customer])

  const form = useAppForm({
    defaultValues,
    validationLogic: revalidateLogic(),
    validators: { onDynamic: customer ? customerFormSchema : newCustomerSchema },
    onSubmit: async ({ value, formApi }) => {
      const result = await save.mutateAsync(value).catch(() => null)
      if (!result) return
      if (!result.ok) return applyServerErrors(formApi, result)
      if (!customer) return navigate({ to: '/admin/customers' })
      formApi.reset({ ...value, password: '' })
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
        <Link to="/admin/customers" className={buttonVariants({ variant: 'ghost', size: 'icon' })} aria-label="Back">
          <HugeiconsIcon icon={ArrowLeft01Icon} />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="font-semibold text-2xl tracking-tight">{customer ? customer.name : 'New customer'}</h1>
          <p className="mt-1 truncate text-muted-foreground">
            {customer ? `Joined ${formatDate(customer.createdAt)}` : 'Create an account someone can sign in with'}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <form.AppField name="name">{(field) => <field.TextField label="Name" autoComplete="off" />}</form.AppField>
          <form.AppField name="email">
            {(field) => <field.TextField label="Email" type="email" autoComplete="off" />}
          </form.AppField>
          <form.AppField name="phone">
            {(field) => (
              <field.TextField
                label="Phone"
                type="tel"
                inputMode="numeric"
                placeholder="01XXXXXXXXX"
                description="Optional"
                autoComplete="off"
              />
            )}
          </form.AppField>
          <form.AppField name="role">
            {(field) => (
              <field.SelectField
                label="Role"
                options={roleOptions}
                description="Admins can sign in to this dashboard and change everything in the store."
              />
            )}
          </form.AppField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{customer ? 'Set a new password' : 'Password'}</CardTitle>
          <CardDescription>
            {customer
              ? 'Leave this empty to keep the current password.'
              : 'Share it with the customer so they can sign in. They can change it later.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form.AppField name="password">
            {(field) => (
              <field.TextField
                label={customer ? 'New password' : 'Password'}
                type="password"
                autoComplete="new-password"
                description="At least 8 characters."
              />
            )}
          </form.AppField>
        </CardContent>
      </Card>

      {customer && <Activity customer={customer} />}

      <div className="sticky bottom-0 z-10 -mx-4 flex items-center justify-end gap-3 border-t bg-background/95 px-4 py-3 backdrop-blur">
        <form.Subscribe selector={(state) => state.isDirty}>
          {(isDirty) => isDirty && <span className="mr-auto text-muted-foreground text-sm">Unsaved changes</span>}
        </form.Subscribe>
        <Link to="/admin/customers" className={buttonVariants({ variant: 'outline' })}>
          Cancel
        </Link>
        <form.AppForm>
          <form.SubmitButton
            className="min-w-32"
            label={customer ? 'Save changes' : 'Create account'}
            pendingLabel="Saving…"
          />
        </form.AppForm>
      </div>
    </form>
  )
}

function Activity({ customer }: { customer: AdminCustomerDetail }) {
  const money = useMoney()
  const { orders, reviews, questions } = customer._count
  const stats = [
    { label: 'Orders', value: orders },
    { label: 'Reviews', value: reviews },
    { label: 'Questions', value: questions },
  ]
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity</CardTitle>
        {orders > customer.orders.length && (
          <CardDescription>Showing the {customer.orders.length} most recent orders.</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <dl className="grid grid-cols-3 gap-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-lg border p-3">
              <dt className="text-muted-foreground text-sm">{stat.label}</dt>
              <dd className="font-mono font-semibold text-xl">{formatNumber(stat.value)}</dd>
            </div>
          ))}
        </dl>
        {customer.orders.length === 0 ? (
          <p className="text-muted-foreground text-sm">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customer.orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <Link
                        to="/admin/orders"
                        search={{ order: order.id }}
                        className="font-medium underline-offset-4 hover:underline"
                      >
                        {order.orderNumber}
                      </Link>
                    </TableCell>
                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                    <TableCell>{money(order.total)}</TableCell>
                    <TableCell>
                      <Badge variant={orderStatusBadge[order.orderStatus]}>{orderStatusLabels[order.orderStatus]}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
