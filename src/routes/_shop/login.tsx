import { createFileRoute, Link, redirect, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { useAppForm } from '@/components/form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldError } from '@/components/ui/field'
import { authSearchSchema } from '@/features/account/schemas'
import { getCurrentUser, login } from '@/features/auth/auth.functions'
import { loginSchema } from '@/features/auth/schemas'

export const Route = createFileRoute('/_shop/login')({
  validateSearch: authSearchSchema,
  beforeLoad: async ({ search }) => {
    if (await getCurrentUser()) throw redirect({ href: search.redirect ?? '/' })
  },
  head: () => ({ meta: [{ title: 'Sign in' }, { name: 'robots', content: 'noindex' }] }),
  component: LoginPage,
})

function LoginPage() {
  const router = useRouter()
  const search = Route.useSearch()
  const [error, setError] = useState('')
  const form = useAppForm({
    defaultValues: { email: '', password: '' },
    validators: { onSubmit: loginSchema, onBlur: loginSchema },
    onSubmit: async ({ value }) => {
      setError('')
      try {
        const result = await login({ data: value })
        if (!result.ok) return setError(result.error)
        await router.invalidate()
        await router.navigate({ href: search.redirect ?? '/' })
      } catch {
        setError("We couldn't sign you in right now. Please try again.")
      }
    },
  })

  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4 py-10">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Sign in</CardTitle>
          <CardDescription>See your orders and check out faster</CardDescription>
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
          <p className="mt-6 text-center text-muted-foreground text-sm">
            New here?{' '}
            <Link to="/register" search={search} className="font-medium text-foreground underline-offset-4 hover:underline">
              Create an account
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
