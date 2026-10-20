import * as v from 'valibot'
import {
  hexColor,
  isLink,
  LINK_HINT,
  optionalEmail,
  optionalImage,
  optionalLink,
  optionalText,
  requiredLink,
  requiredText,
} from './fields'

const optionalPhone = () =>
  v.pipe(
    v.string(),
    v.trim(),
    v.check((value) => !value || /^\+?[0-9][0-9 -]{5,19}$/.test(value), 'Enter a phone number, like +8801712345678'),
    v.transform((value) => value || null),
  )

const isTimeZone = (zone: string) => zone === 'UTC' || Intl.supportedValuesOf('timeZone').includes(zone)

export const basicSettingsSchema = v.pipe(
  v.object({
    siteName: requiredText('Enter your store name', 60),
    siteDescription: optionalText(300),
    logo: optionalImage(),
    favicon: optionalImage(),
    promoActive: v.boolean(),
    promoText: optionalText(200),
    promoLink: optionalLink(),
    metaTitle: optionalText(70),
    metaDescription: optionalText(160),
    metaKeywords: optionalText(300),
    ogImage: optionalImage(),
    supportEmail: optionalEmail(),
    supportPhone: optionalPhone(),
    currency: v.pipe(v.string(), v.trim(), v.toUpperCase(), v.regex(/^[A-Z]{3}$/, 'Use a 3-letter code, like BDT')),
    currencySymbol: requiredText('Enter the currency symbol', 5),
    timezone: v.pipe(v.string(), v.trim(), v.check(isTimeZone, 'Use a time zone name, like Asia/Dhaka')),
    enableWishlist: v.boolean(),
    enableReviews: v.boolean(),
    enableCoupons: v.boolean(),
    bkashNumber: v.pipe(
      v.string(),
      v.trim(),
      v.check((value) => !value || /^01[0-9]{9}$/.test(value), 'Enter an 11-digit number starting with 01'),
      v.transform((value) => value || null),
    ),
    bkashNote: optionalText(300),
  }),
  v.forward(
    v.partialCheck(
      [['promoActive'], ['promoText']],
      (input) => !input.promoActive || !!input.promoText,
      'Write the message to show in the bar',
    ),
    ['promoText'],
  ),
)
export type BasicSettingsInput = v.InferInput<typeof basicSettingsSchema>

export const footerSettingsSchema = v.object({
  logo: optionalImage(),
  description: optionalText(500),
  copyrightText: optionalText(200),
  paymentMethods: v.pipe(
    v.array(v.pipe(v.string(), v.check(isLink, 'Use image links starting with https://'))),
    v.maxLength(12, 'Add up to 12 payment logos'),
  ),
  showPaymentMethods: v.boolean(),
  enableNewsletter: v.boolean(),
  newsletterTitle: optionalText(200),
  newsletterText: optionalText(300),
  backgroundColor: hexColor(),
  textColor: hexColor(),
})
export type FooterSettingsInput = v.InferInput<typeof footerSettingsSchema>

export const contactInfoSchema = v.object({
  phone: optionalPhone(),
  email: optionalEmail(),
  address: optionalText(300),
  workingHours: optionalText(100),
  description: optionalText(500),
})
export type ContactInfoInput = v.InferInput<typeof contactInfoSchema>

export const footerSectionSchema = v.object({
  title: requiredText('Enter a heading', 60),
  active: v.boolean(),
})
export type FooterSectionInput = v.InferInput<typeof footerSectionSchema>

export const footerLinkSchema = v.object({
  sectionId: v.pipe(v.string(), v.minLength(1, 'Choose a column')),
  label: requiredText('Enter the link text', 60),
  url: requiredLink(),
  active: v.boolean(),
})
export type FooterLinkInput = v.InferInput<typeof footerLinkSchema>

export const socialPlatforms = [
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'twitter', label: 'X (Twitter)' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'tiktok', label: 'TikTok' },
] as const
export const platformLabel = (value: string) => socialPlatforms.find((p) => p.value === value)?.label ?? value

export const socialLinkSchema = v.object({
  platform: v.picklist(
    socialPlatforms.map((p) => p.value),
    'Choose a platform',
  ),
  url: v.pipe(
    v.string(),
    v.trim(),
    v.minLength(1, 'Enter the link to your page'),
    v.check((value) => !value || (isLink(value) && value.startsWith('https://')), 'Use a full link starting with https://'),
  ),
  active: v.boolean(),
})
export type SocialLinkInput = v.InferInput<typeof socialLinkSchema>

export const menuTypes = [
  { value: 'CUSTOM', label: 'Any link' },
  { value: 'CATEGORY', label: 'A category' },
  { value: 'PRODUCT', label: 'A product' },
  { value: 'PAGE', label: 'A page' },
] as const

export const TOP_LEVEL = 'top'

export const menuItemSchema = v.pipe(
  v.object({
    label: requiredText('Enter the text to show', 60),
    type: v.picklist(menuTypes.map((t) => t.value)),
    url: v.pipe(v.string(), v.trim()),
    targetId: v.string(),
    // The select can't hold an empty value, so "top" stands for no parent
    parentId: v.pipe(
      v.string(),
      v.transform((value) => (value === TOP_LEVEL ? '' : value)),
    ),
    openInNewTab: v.boolean(),
    megaMenu: v.boolean(),
    featured: v.boolean(),
    active: v.boolean(),
  }),
  v.forward(
    v.partialCheck([['type'], ['url']], (input) => input.type !== 'CUSTOM' || isLink(input.url), LINK_HINT),
    ['url'],
  ),
  v.forward(
    v.partialCheck(
      [['type'], ['targetId']],
      (input) => input.type === 'CUSTOM' || !!input.targetId,
      'Choose what this item links to',
    ),
    ['targetId'],
  ),
)
export type MenuItemInput = v.InferInput<typeof menuItemSchema>
