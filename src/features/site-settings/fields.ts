import * as v from 'valibot'

export const isLink = (value: string) => {
  if (value.startsWith('/')) return !value.startsWith('//')
  try {
    return new URL(value).protocol === 'https:'
  } catch {
    return false
  }
}
export const LINK_HINT = 'Use a page on this site starting with / or a full link starting with https://'

// Optional text: blank input is stored as null
export const optionalText = (max = 200) =>
  v.pipe(
    v.string(),
    v.trim(),
    v.maxLength(max, `Keep this under ${max} characters`),
    v.transform((value) => value || null)
  )

export const requiredText = (message: string, max = 200) =>
  v.pipe(v.string(), v.trim(), v.minLength(1, message), v.maxLength(max, `Keep this under ${max} characters`))

export const requiredLink = (message = 'Enter a link') =>
  v.pipe(
    v.string(),
    v.trim(),
    v.minLength(1, message),
    v.check((value) => !value || isLink(value), LINK_HINT)
  )

export const optionalLink = () =>
  v.pipe(
    v.string(),
    v.trim(),
    v.check((value) => !value || isLink(value), LINK_HINT),
    v.transform((value) => value || null)
  )

export const requiredImage = (message = 'Add an image') => requiredLink(message)
export const optionalImage = optionalLink

export const optionalEmail = () =>
  v.pipe(
    v.string(),
    v.trim(),
    v.check((value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), 'Enter a valid email address'),
    v.transform((value) => value || null)
  )

export const hexColor = () =>
  v.pipe(v.string(), v.trim(), v.regex(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i, 'Use a colour code like #1a1a1a'))

// Edit screens send { id, values }; id is absent when creating
export const withId = <S extends v.GenericSchema>(values: S) =>
  v.object({ id: v.optional(v.pipe(v.string(), v.minLength(1))), values })

export const idSchema = v.object({ id: v.pipe(v.string(), v.minLength(1)) })
