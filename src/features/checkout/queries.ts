import { keepPreviousData, queryOptions, useMutation } from '@tanstack/react-query'
import { getCheckoutQuote, placeOrder } from './checkout.functions'
import type { QuoteInput } from './schemas'

export const checkoutKeys = {
  all: ['checkout'] as const,
  quote: (input: QuoteInput) => [...checkoutKeys.all, 'quote', input] as const,
}

export const checkoutQuoteQuery = (input: QuoteInput) =>
  queryOptions({
    queryKey: checkoutKeys.quote(input),
    queryFn: () => getCheckoutQuote({ data: input }),
    placeholderData: keepPreviousData,
    staleTime: 0,
  })

export const useCheckCoupon = () => useMutation({ mutationFn: (input: QuoteInput) => getCheckoutQuote({ data: input }) })

export const usePlaceOrder = () => useMutation({ mutationFn: placeOrder })
