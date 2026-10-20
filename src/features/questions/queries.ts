import { infiniteQueryOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import { answerQuestion, askQuestion, listQuestions } from './questions.functions'

export const questionKeys = {
  all: ['questions'] as const,
  product: (productId: string) => [...questionKeys.all, productId] as const,
}

export const questionsQuery = (productId: string) =>
  infiniteQueryOptions({
    queryKey: questionKeys.product(productId),
    queryFn: ({ pageParam }) => listQuestions({ data: { productId, page: pageParam } }),
    initialPageParam: 1,
    getNextPageParam: (last, pages) => (last.hasMore ? pages.length + 1 : undefined),
  })

export function useAskQuestion() {
  return useMutation({ mutationFn: askQuestion })
}

export function useAnswerQuestion(productId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: answerQuestion,
    onSuccess: (result) => {
      if (result.ok && result.published) return queryClient.invalidateQueries({ queryKey: questionKeys.product(productId) })
    },
  })
}
