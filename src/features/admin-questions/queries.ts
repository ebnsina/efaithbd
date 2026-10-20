import { keepPreviousData, queryOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  createAnswer,
  deleteAnswer,
  deleteQuestion,
  getAdminQuestion,
  listAdminQuestions,
  setAnswerApproval,
  setQuestionApproval,
  updateAnswer,
} from './admin-questions.functions'
import type { QuestionSearch } from './schemas'

const adminQuestionKeys = {
  all: ['admin', 'questions'] as const,
  list: (search: QuestionSearch) => [...adminQuestionKeys.all, 'list', search] as const,
  detail: (id: string) => [...adminQuestionKeys.all, 'detail', id] as const,
}

export const adminQuestionListQuery = (search: QuestionSearch) =>
  queryOptions({
    queryKey: adminQuestionKeys.list(search),
    queryFn: () => listAdminQuestions({ data: search }),
    placeholderData: keepPreviousData,
  })

export const adminQuestionQuery = (id: string) =>
  queryOptions({
    queryKey: adminQuestionKeys.detail(id),
    queryFn: () => getAdminQuestion({ data: { id } }),
  })

function useQuestionMutation<T>(mutationFn: (input: T) => Promise<unknown>, success: (input: T) => string, failure: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: (_, input) => {
      toast.success(success(input))
      return queryClient.invalidateQueries({ queryKey: adminQuestionKeys.all })
    },
    onError: () => toast.error(failure),
  })
}

export const useSetQuestionApproval = () =>
  useQuestionMutation(
    (data: { id: string; approved: boolean }) => setQuestionApproval({ data }),
    ({ approved }) => (approved ? 'Question published in the store' : 'Question hidden from the store'),
    'Could not update this question. Please try again.',
  )

export const useDeleteQuestion = () =>
  useQuestionMutation(
    (id: string) => deleteQuestion({ data: { id } }),
    () => 'Question deleted',
    'Could not delete this question. Please try again.',
  )

export const useCreateAnswer = () =>
  useQuestionMutation(
    (data: { questionId: string; values: { answer: string } }) => createAnswer({ data }),
    () => 'Answer posted',
    'Could not post your answer. Please try again.',
  )

export const useUpdateAnswer = () =>
  useQuestionMutation(
    (data: { id: string; values: { answer: string } }) => updateAnswer({ data }),
    () => 'Answer updated',
    'Could not update this answer. Please try again.',
  )

export const useSetAnswerApproval = () =>
  useQuestionMutation(
    (data: { id: string; approved: boolean }) => setAnswerApproval({ data }),
    ({ approved }) => (approved ? 'Answer shown in the store' : 'Answer hidden from the store'),
    'Could not update this answer. Please try again.',
  )

export const useDeleteAnswer = () =>
  useQuestionMutation(
    (id: string) => deleteAnswer({ data: { id } }),
    () => 'Answer deleted',
    'Could not delete this answer. Please try again.',
  )
