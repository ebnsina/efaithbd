import {
  Call02Icon,
  CheckmarkBadge01Icon,
  CreditCardIcon,
  CustomerSupportIcon,
  DeliveryTruck01Icon,
  GiftIcon,
  ReturnRequestIcon,
  Shield01Icon,
} from '@hugeicons/core-free-icons'

// Stored keys → icons; the storefront strip can import this same map
export const highlightIcons = {
  delivery: { icon: DeliveryTruck01Icon, label: 'Delivery' },
  returns: { icon: ReturnRequestIcon, label: 'Returns' },
  shield: { icon: Shield01Icon, label: 'Safety' },
  support: { icon: CustomerSupportIcon, label: 'Support' },
  payment: { icon: CreditCardIcon, label: 'Payment' },
  gift: { icon: GiftIcon, label: 'Gift' },
  quality: { icon: CheckmarkBadge01Icon, label: 'Quality' },
  phone: { icon: Call02Icon, label: 'Phone' },
}
export type HighlightIconKey = keyof typeof highlightIcons
export const highlightIconKeys = Object.keys(highlightIcons) as [HighlightIconKey, ...HighlightIconKey[]]
