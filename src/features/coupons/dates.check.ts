// Run: npx tsx src/features/coupons/dates.check.ts
import assert from 'node:assert'
import * as v from 'valibot'
import { dayIn, zonedTime } from './dates'
import { couponSchema } from './schemas'

assert.equal(zonedTime('2026-10-20', '00:00:00.000', 'Asia/Dhaka').toISOString(), '2026-10-19T18:00:00.000Z')
assert.equal(zonedTime('2026-10-20', '23:59:59.999', 'Asia/Dhaka').toISOString(), '2026-10-20T17:59:59.999Z')
assert.equal(zonedTime('2026-07-01', '00:00:00.000', 'America/New_York').toISOString(), '2026-07-01T04:00:00.000Z')
assert.equal(dayIn('2026-10-19T18:00:00.000Z', 'Asia/Dhaka'), '2026-10-20')

const coupon = {
  code: 'EID10',
  description: '',
  type: 'PERCENTAGE',
  value: 10,
  minPurchase: null,
  maxDiscount: null,
  usageLimit: null,
  validFrom: '2026-10-01',
  validTo: '2026-10-31',
  active: true,
}
const issues = (input: object) => v.safeParse(couponSchema, input).issues?.map((i) => i.message) ?? []
assert.deepEqual(issues(coupon), [])
assert.deepEqual(issues({ ...coupon, value: 120 }), ['A percentage discount can be at most 100'])
assert.deepEqual(issues({ ...coupon, type: 'FIXED', value: 120 }), [])
assert.deepEqual(issues({ ...coupon, value: null }), ['Enter a discount greater than 0'])
assert.deepEqual(issues({ ...coupon, validTo: '2026-09-30' }), ['The end date must be on or after the start date'])
console.log('ok')
