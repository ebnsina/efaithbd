import { LockPasswordIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { revalidateLogic } from '@tanstack/react-form'
import { createFileRoute, Link, redirect, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { useAppForm } from '@/components/form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldError } from '@/components/ui/field'
import { getCurrentUser, login } from '@/features/auth/auth.functions'
import { loginSchema } from '@/features/auth/schemas'

export const Route = createFileRoute('/auth/admin-login')({
  beforeLoad: async () => {
    if ((await getCurrentUser())?.role === 'ADMIN') throw redirect({ to: '/admin' })
  },
  head: () => ({ meta: [{ title: 'Admin login' }, { name: 'robots', content: 'noindex' }] }),
  component: AdminLogin,
})

function AdminLogin() {
  const router = useRouter()
  const [error, setError] = useState('')
  const form = useAppForm({
    defaultValues: { email: '', password: '' },
    validationLogic: revalidateLogic(),
    validators: { onDynamic: loginSchema },
    onSubmit: async ({ value }) => {
      setError('')
      const result = await login({ data: value })
      if (!result.ok) return setError(result.error)
      if (result.role !== 'ADMIN') return setError('This account does not have admin access')
      await router.invalidate()
      await router.navigate({ to: '/admin' })
    },
  })

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <HugeiconsIcon icon={LockPasswordIcon} />
          </div>
          <CardTitle className="text-xl">
            <h1>Admin login</h1>
          </CardTitle>
          <CardDescription>Sign in to manage your store</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            method="post"
            noValidate
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              form.handleSubmit()
            }}
          >
            <form.AppField name="email">
              {(field) => <field.TextField label="Email" type="email" autoComplete="email" />}
            </form.AppField>
            <form.AppField name="password">
              {(field) => <field.TextField label="Password" type="password" autoComplete="current-password" />}
            </form.AppField>
            {error && <FieldError>{error}</FieldError>}
            <form.AppForm>
              <form.SubmitButton label="Sign in" pendingLabel="Signing in…" />
            </form.AppForm>
          </form>
          <Link to="/" className="mt-6 block text-center text-muted-foreground text-sm hover:text-foreground">
            ← Back to the store
          </Link>
        </CardContent>
      </Card>
    </main>
  )
}
