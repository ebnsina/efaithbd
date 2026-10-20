import type { CartLine } from './schemas'

type Coupon = {
  type: 'PERCENTAGE' | 'FIXED'
  value: number
  minPurchase: number | null
  maxDiscount: number | null
  validFrom: Date
  validTo: Date
  usageLimit: number | null
  usageCount: number
  active: boolean
}

const number = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 })
const round = (amount: number) => Math.round(amount * 100) / 100

// Same line twice (e.g. added from two tabs) counts once, so stock is checked against the real total
export function mergeLines(lines: CartLine[]): CartLine[] {
  const merged = new Map<string, CartLine>()
  for (const line of lines) {
    const key = `${line.productId}:${line.variantId ?? ''}`
    const existing = merged.get(key)
    merged.set(key, existing ? { ...existing, quantity: existing.quantity + line.quantity } : line)
  }
  return [...merged.values()]
}

export function couponProblem(coupon: Coupon | null, subtotal: number, currencySymbol: string, now = new Date()) {
  if (!coupon || !coupon.active) return "This coupon code isn't valid"
  if (now < coupon.validFrom) return "This coupon can't be used yet"
  if (now > coupon.validTo) return 'This coupon has expired'
  if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) return 'This coupon has been fully used'
  if (coupon.minPurchase && subtotal < coupon.minPurchase)
    return `Spend at least ${currencySymbol}${number.format(coupon.minPurchase)} to use this coupon`
  return null
}

export function couponDiscount(coupon: Coupon, subtotal: number) {
  const raw = coupon.type === 'PERCENTAGE' ? (subtotal * coupon.value) / 100 : coupon.value
  const capped = coupon.type === 'PERCENTAGE' && coupon.maxDiscount ? Math.min(raw, coupon.maxDiscount) : raw
  return round(Math.max(0, Math.min(capped, subtotal)))
}

export const shippingFits = (method: { minOrder: number | null; maxOrder: number | null }, subtotal: number) =>
  (!method.minOrder || subtotal >= method.minOrder) && (!method.maxOrder || subtotal <= method.maxOrder)

export const variantLabel = (variant: { name: string; value: string }) =>
  variant.name === variant.value ? variant.value : `${variant.name}: ${variant.value}`
