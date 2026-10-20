// Run: npx tsx src/features/account/schemas.check.ts
import assert from 'node:assert'
import * as v from 'valibot'
import { authSearchSchema } from './schemas'

const redirectOf = (redirect: unknown) => v.parse(authSearchSchema, { redirect }).redirect

assert.equal(redirectOf('/checkout'), '/checkout')
assert.equal(redirectOf('/orders?tab=1#x'), '/orders?tab=1#x')
assert.equal(redirectOf(undefined), undefined)
for (const bad of ['//evil.com', '/\\evil.com', 'https://evil.com', 'javascript:alert(1)', '/\tevil', 42, '']) {
  assert.equal(redirectOf(bad), undefined, String(bad))
}
console.log('account schemas ok')
