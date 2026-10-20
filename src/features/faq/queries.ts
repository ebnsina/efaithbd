import { queryOptions } from '@tanstack/react-query'
import { listFaqs } from './faq.functions'

export const faqKeys = { all: ['faqs'] as const }

export const faqsQuery = queryOptions({ queryKey: faqKeys.all, queryFn: () => listFaqs() })
