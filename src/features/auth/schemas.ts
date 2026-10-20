import * as v from 'valibot'

export const loginSchema = v.object({
  email: v.pipe(v.string(), v.trim(), v.toLowerCase(), v.email('Enter a valid email address')),
  password: v.pipe(v.string(), v.minLength(1, 'Enter your password')),
})

export const registerSchema = v.object({
  name: v.pipe(v.string(), v.trim(), v.minLength(2, 'Enter your name'), v.maxLength(100)),
  email: v.pipe(v.string(), v.trim(), v.toLowerCase(), v.email('Enter a valid email address')),
  phone: v.pipe(v.string(), v.trim(), v.regex(/^01[0-9]{9}$/, 'Enter an 11-digit phone number starting with 01')),
  password: v.pipe(v.string(), v.minLength(8, 'Use at least 8 characters'), v.maxLength(100)),
})
