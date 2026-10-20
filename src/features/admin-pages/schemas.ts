import * as v from 'valibot'
import { optionalText, requiredText } from '@/features/site-settings/fields'

// Paths the store already uses; a page with one of these links would never be reachable
export const reservedSlugs = [
  'products',
  'categories',
  'cart',
  'wishlist',
  'checkout',
  'orders',
  'login',
  'register',
  'contact',
  'faq',
  'admin',
  'auth',
  'api',
]

export const slugify = (text: string) =>
  text
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)

export const pageSchema = v.object({
  title: requiredText('Enter a title', 120),
  slug: v.pipe(
    v.string(),
    v.trim(),
    v.toLowerCase(),
    v.minLength(1, 'Enter the page link'),
    v.maxLength(80, 'Keep the link under 80 characters'),
    v.check(
      (slug) => !slug || /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug),
      'Use only English letters, numbers and single dashes, like return-policy'
    ),
    v.check((slug) => !reservedSlugs.includes(slug), 'This link is already used by the store. Choose another.')
  ),
  content: requiredText('Write the page content', 50_000),
  metaDescription: optionalText(160),
  published: v.boolean(),
})
export type PageInput = v.InferInput<typeof pageSchema>
