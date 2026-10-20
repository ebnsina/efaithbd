import * as v from 'valibot'
import { listSearchEntries } from '@/lib/list-search'

export const adminProductSearchSchema = v.object({
  ...listSearchEntries,
  status: v.optional(v.fallback(v.optional(v.picklist(['active', 'inactive', 'featured'])), undefined)),
})
export type AdminProductSearch = v.InferOutput<typeof adminProductSearchSchema>

// Existing slugs carry uppercase and leading dashes from the old editor; accept them so editing doesn't break links
export const slugSchema = v.pipe(
  v.string(),
  v.trim(),
  v.nonEmpty('Enter a web address'),
  v.maxLength(150, 'Keep the web address under 150 characters'),
  v.regex(/^[A-Za-z0-9-]*$/, 'Use only letters, numbers and dashes'),
)

export const slugify = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const requiredText = (message: string, max = 100) =>
  v.pipe(v.string(), v.trim(), v.nonEmpty(message), v.maxLength(max, `Keep this under ${max} characters`))
const amount = (message: string) => v.pipe(v.number(message), v.minValue(0, "This can't be negative"))
// Starts empty in the form (null) but must be filled in
const requiredAmount = (message: string) =>
  v.pipe(
    v.nullable(v.number(message)),
    v.check((value) => value !== null, message),
    v.transform((value) => value as number),
    v.minValue(0, "This can't be negative"),
  )
const count = (message: string) =>
  v.pipe(v.number(message), v.integer('Use a whole number'), v.minValue(0, "This can't be negative"))

export const MAX_PRODUCT_IMAGES = 8

export const variantFormSchema = v.object({
  id: v.string(),
  name: requiredText('Enter the option, like Size'),
  value: requiredText('Enter the choice, like Large'),
  price: v.nullable(amount('Enter an amount')),
  stock: count('Enter the stock'),
  sku: v.pipe(v.string(), v.trim(), v.maxLength(64, 'Keep the SKU under 64 characters')),
})

export const productFormSchema = v.pipe(
  v.object({
    name: requiredText('Enter a product name', 200),
    slug: slugSchema,
    description: requiredText('Enter a description', 20000),
    price: requiredAmount('Enter a price'),
    comparePrice: v.nullable(amount('Enter an amount')),
    stock: count('Enter the stock'),
    images: v.pipe(
      v.array(v.pipe(v.string(), v.url())),
      v.minLength(1, 'Add at least one image'),
      v.maxLength(MAX_PRODUCT_IMAGES, `Add up to ${MAX_PRODUCT_IMAGES} images`),
    ),
    categoryId: v.pipe(v.string(), v.nonEmpty('Choose a category')),
    subcategoryId: v.string(),
    featured: v.boolean(),
    active: v.boolean(),
    variants: v.pipe(v.array(variantFormSchema), v.maxLength(50, 'Add up to 50 variants')),
  }),
  v.forward(
    v.partialCheck(
      [['price'], ['comparePrice']],
      ({ price, comparePrice }) => comparePrice == null || comparePrice > price,
      'The compare price should be higher than the price, or left empty',
    ),
    ['comparePrice'],
  ),
)
export type ProductFormValues = v.InferInput<typeof productFormSchema>

export const updateProductSchema = v.object({ id: v.string(), values: productFormSchema })

// Field errors keyed by form field name, e.g. "slug" or "variants[1].sku"
export type SaveResult = { ok: true; id: string } | { ok: false; error: string; fieldErrors?: Record<string, string> }
