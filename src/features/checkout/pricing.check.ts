// Run: npx tsx src/features/checkout/pricing.check.ts
import assert from 'node:assert'
import { couponDiscount, couponProblem, mergeLines, shippingFits } from './pricing'

const now = new Date('2026-06-01')
const coupon = {
  type: 'PERCENTAGE' as const,
  value: 15,
  minPurchase: 500,
  maxDiscount: 100,
  validFrom: new Date('2026-01-01'),
  validTo: new Date('2026-12-31'),
  usageLimit: 10,
  usageCount: 9,
  active: true,
}

assert.equal(couponProblem(coupon, 600, '৳', now), null)
assert.equal(couponProblem(coupon, 400, '৳', now), 'Spend at least ৳500 to use this coupon')
assert.equal(couponProblem({ ...coupon, usageCount: 10 }, 600, '৳', now), 'This coupon has been fully used')
assert.equal(couponProblem(coupon, 600, '৳', new Date('2027-01-01')), 'This coupon has expired')
assert.equal(couponProblem({ ...coupon, active: false }, 600, '৳', now), "This coupon code isn't valid")
assert.equal(couponProblem(null, 600, '৳', now), "This coupon code isn't valid")

assert.equal(couponDiscount(coupon, 600), 90)
assert.equal(couponDiscount(coupon, 1000), 100)
assert.equal(couponDiscount({ ...coupon, maxDiscount: null, value: 12.5 }, 99.99), 12.5)
assert.equal(couponDiscount({ ...coupon, type: 'FIXED', value: 300 }, 200), 200)

assert.deepStrictEqual(
  mergeLines([
    { productId: 'a', quantity: 1 },
    { productId: 'a', variantId: 'x', quantity: 2 },
    { productId: 'a', quantity: 3 },
  ]),
  [
    { productId: 'a', quantity: 4 },
    { productId: 'a', variantId: 'x', quantity: 2 },
  ],
)

assert.equal(shippingFits({ minOrder: null, maxOrder: null }, 10), true)
assert.equal(shippingFits({ minOrder: 1000, maxOrder: null }, 999), false)
assert.equal(shippingFits({ minOrder: null, maxOrder: 1000 }, 1000), true)
console.log('pricing ok')
