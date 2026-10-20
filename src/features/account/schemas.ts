import * as v from 'valibot'

// Same-site paths only: '//evil.com' and '/\evil.com' are read by browsers as another host
export const isSafeRedirect = (path: string) =>
  path.startsWith('/') && !path.startsWith('//') && !path.startsWith('/\\') && !/[\s\u0000-\u001f]/.test(path)

export const authSearchSchema = v.object({
  redirect: v.optional(v.fallback(v.optional(v.pipe(v.string(), v.maxLength(500), v.check(isSafeRedirect))), undefined)),
})
