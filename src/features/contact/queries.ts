import { queryOptions } from '@tanstack/react-query'
import { getContactDetails } from './contact.functions'

export const contactKeys = { all: ['contact'] as const }

export const contactQuery = queryOptions({ queryKey: contactKeys.all, queryFn: () => getContactDetails() })
