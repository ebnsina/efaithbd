import { revalidateLogic } from '@tanstack/react-form'
import { createFileRoute, Link, redirect, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { useAppForm } from '@/components/form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldError } from '@/components/ui/field'
import { authSearchSchema } from '@/features/account/schemas'
import { getCurrentUser, register } from '@/features/auth/auth.functions'
import { registerSchema } from '@/features/auth/schemas'

export const Route = createFileRoute('/_shop/register')({
  validateSearch: authSearchSchema,
  beforeLoad: async ({ search }) => {
    if (await getCurrentUser()) throw redirect({ href: search.redirect ?? '/' })
  },
  head: () => ({ meta: [{ title: 'Create an account' }, { name: 'robots', content: 'noindex' }] }),
  component: RegisterPage,
})

function RegisterPage() {
  const router = useRouter()
  const search = Route.useSearch()
  const [error, setError] = useState('')
  const form = useAppForm({
    defaultValues: { name: '', email: '', phone: '', password: '' },
    validationLogic: revalidateLogic(),
    validators: { onDynamic: registerSchema },
    onSubmit: async ({ value }) => {
      setError('')
      try {
        const result = await register({ data: value })
        if (!result.ok) return setError(result.error)
        await router.invalidate()
        await router.navigate({ href: search.redirect ?? '/' })
      } catch {
        setError("We couldn't create your account right now. Please try again.")
      }
    },
  })

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-10">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create an account</CardTitle>
          <CardDescription>Keep all your orders in one place</CardDescription>
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
            <form.AppField name="name">
              {(field) => <field.TextField label="Full name" autoComplete="name" />}
            </form.AppField>
            <form.AppField name="email">
              {(field) => <field.TextField label="Email" type="email" autoComplete="email" />}
            </form.AppField>
            <form.AppField name="phone">
              {(field) => (
                <field.TextField
                  label="Mobile number"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  placeholder="01XXXXXXXXX"
                  maxLength={11}
                />
              )}
            </form.AppField>
            <form.AppField name="password">
              {(field) => (
                <field.TextField
                  label="Password"
                  type="password"
                  autoComplete="new-password"
                  description="At least 8 characters"
                />
              )}
            </form.AppField>
            {error && <FieldError>{error}</FieldError>}
            <form.AppForm>
              <form.SubmitButton label="Create account" pendingLabel="Creating your account…" />
            </form.AppForm>
          </form>
          <p className="mt-6 text-center text-muted-foreground text-sm">
            Already have an account?{' '}
            <Link to="/login" search={search} className="font-medium text-foreground underline-offset-4 hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
