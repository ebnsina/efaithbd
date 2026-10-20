import * as v from 'valibot'
import { listSearchEntries } from '@/lib/list-search'

export const roles = ['CUSTOMER', 'ADMIN'] as const
export const roleLabels: Record<(typeof roles)[number], string> = { CUSTOMER: 'Customer', ADMIN: 'Admin' }

export const adminCustomerSearchSchema = v.object({
  ...listSearchEntries,
  role: v.optional(v.fallback(v.optional(v.picklist(roles)), undefined)),
})
export type AdminCustomerSearch = v.InferOutput<typeof adminCustomerSearchSchema>

const accountEntries = {
  name: v.pipe(v.string(), v.trim(), v.minLength(2, 'Enter a name'), v.maxLength(100, 'Keep the name under 100 characters')),
  email: v.pipe(v.string(), v.trim(), v.toLowerCase(), v.email('Enter a valid email address'), v.maxLength(200)),
  phone: v.pipe(
    v.string(),
    v.trim(),
    v.check((phone) => phone === '' || /^01[0-9]{9}$/.test(phone), 'Enter an 11-digit phone number starting with 01'),
  ),
  role: v.picklist(roles, 'Choose a role'),
}

// Same shape for both, so the form can swap schemas; on edit an empty password keeps the current one
const passwordSchema = (required: boolean) =>
  v.pipe(
    v.string(),
    v.check(
      (password) => password.length >= 8 || (!required && password === ''),
      (issue) => (issue.input === '' ? 'Set a password for this account' : 'Use at least 8 characters'),
    ),
    v.maxLength(100, 'Keep the password under 100 characters'),
  )

export const customerFormSchema = v.object({ ...accountEntries, password: passwordSchema(false) })
export const newCustomerSchema = v.object({ ...accountEntries, password: passwordSchema(true) })

export type CustomerFormValues = v.InferInput<typeof customerFormSchema>

export const updateCustomerSchema = v.object({ id: v.string(), values: customerFormSchema })

export type SaveResult = { ok: true; id: string } | { ok: false; error: string; fieldErrors?: Record<string, string> }
