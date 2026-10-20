'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

type Answer = {
  id: string
  answer: string
  isOfficial: boolean
  approved: boolean
  createdAt: string
  user: {
    name: string
  } | null
}

type Question = {
  id: string
  question: string
  approved: boolean
  createdAt: string
  user: {
    name: string
  } | null
  answers: Answer[]
}

export function ProductQuestions({ productId }: { productId: string }) {
  const [isAskingQuestion, setIsAskingQuestion] = useState(false)
  const [questionText, setQuestionText] = useState('')
  const [answeringQuestionId, setAnsweringQuestionId] = useState<string | null>(
    null
  )
  const [answerText, setAnswerText] = useState('')
  const queryClient = useQueryClient()

  const {
    data: questions = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['questions', productId],
    queryFn: async () => {
      const response = await fetch(`/api/questions?productId=${productId}`)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to fetch questions')
      }
      return response.json() as Promise<Question[]>
    },
    retry: 2,
    retryDelay: 1000,
  })

  const createQuestionMutation = useMutation({
    mutationFn: async (data: { productId: string; question: string }) => {
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const error = new Error(errorData.error || 'Failed to submit question')
        // Add status code to error for better handling
        ;(error as any).status = response.status
        throw error
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions', productId] })
      setIsAskingQuestion(false)
      setQuestionText('')
      toast.success('Question submitted! It will be visible after approval.')
    },
    onError: (error: any) => {
      if (error.status === 401) {
        toast.error('Please log in to ask a question')
      } else if (error.status === 404) {
        toast.error('Product not found')
      } else {
        toast.error(
          error.message || 'Failed to submit question. Please try again.'
        )
      }
    },
  })

  const createAnswerMutation = useMutation({
    mutationFn: async (data: { questionId: string; answer: string }) => {
      const response = await fetch(
        `/api/questions/${data.questionId}/answers`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answer: data.answer }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const error = new Error(errorData.error || 'Failed to submit answer')
        // Add status code to error for better handling
        ;(error as any).status = response.status
        throw error
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions', productId] })
      setAnsweringQuestionId(null)
      setAnswerText('')
      toast.success('Answer submitted! It will be visible after approval.')
    },
    onError: (error: any) => {
      if (error.status === 401) {
        toast.error('Please log in to answer questions')
      } else if (error.status === 404) {
        toast.error('Question not found')
      } else {
        toast.error(
          error.message || 'Failed to submit answer. Please try again.'
        )
      }
    },
  })

  const handleSubmitQuestion = (e: React.FormEvent) => {
    e.preventDefault()
    if (!questionText.trim()) {
      toast.error('Please write your question')
      return
    }
    createQuestionMutation.mutate({ productId, question: questionText })
  }

  const handleSubmitAnswer = (e: React.FormEvent, questionId: string) => {
    e.preventDefault()
    if (!answerText.trim()) {
      toast.error('Please write your answer')
      return
    }
    createAnswerMutation.mutate({ questionId, answer: answerText })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Questions & Answers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Ask Question Button */}
          {!isAskingQuestion && (
            <Button
              onClick={() => setIsAskingQuestion(true)}
              className="w-full"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Ask a Question
            </Button>
          )}

          {/* Question Form */}
          {isAskingQuestion && (
            <form
              onSubmit={handleSubmitQuestion}
              className="space-y-4 border-t pt-4"
            >
              <div className="space-y-2">
                <Label htmlFor="question-text">Your Question *</Label>
                <Textarea
                  id="question-text"
                  value={questionText}
                  onChange={e => setQuestionText(e.target.value)}
                  placeholder="Ask anything about this product..."
                  rows={4}
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={createQuestionMutation.isPending}
                  className="flex-1"
                >
                  Submit Question
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAskingQuestion(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {/* Questions List */}
          {isLoading ? (
            <p className="text-center py-4">Loading questions...</p>
          ) : isError ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-2">Failed to load questions</p>
              <p className="text-sm text-muted-foreground mb-4">
                {error instanceof Error ? error.message : 'An error occurred'}
              </p>
              <Button
                variant="outline"
                onClick={() =>
                  queryClient.invalidateQueries({
                    queryKey: ['questions', productId],
                  })
                }
              >
                Try Again
              </Button>
            </div>
          ) : questions.length > 0 ? (
            <div className="space-y-6 border-t pt-4">
              {questions.map(question => (
                <div key={question.id} className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MessageSquare className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <p className="font-medium">{question.question}</p>
                      <p className="text-xs text-muted-foreground">
                        Asked by {question.user?.name || 'Anonymous'} on{' '}
                        {new Date(question.createdAt).toLocaleDateString()}
                      </p>

                      {/* Answers */}
                      {question.answers.length > 0 && (
                        <div className="ml-6 space-y-3 border-l-2 pl-4 mt-4">
                          {question.answers.map(answer => (
                            <div key={answer.id} className="space-y-2">
                              <div className="flex items-start gap-2">
                                {answer.isOfficial && (
                                  <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                                )}
                                <div className="flex-1">
                                  <p className="text-sm">{answer.answer}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <p className="text-xs text-muted-foreground">
                                      {answer.user?.name || 'Anonymous'} •{' '}
                                      {new Date(
                                        answer.createdAt
                                      ).toLocaleDateString()}
                                    </p>
                                    {answer.isOfficial && (
                                      <Badge
                                        variant="default"
                                        className="text-xs"
                                      >
                                        Official Answer
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Answer Form */}
                      {answeringQuestionId === question.id ? (
                        <form
                          onSubmit={e => handleSubmitAnswer(e, question.id)}
                          className="mt-4 space-y-2"
                        >
                          <Textarea
                            value={answerText}
                            onChange={e => setAnswerText(e.target.value)}
                            placeholder="Write your answer..."
                            rows={3}
                            required
                          />
                          <div className="flex gap-2">
                            <Button
                              type="submit"
                              size="sm"
                              disabled={createAnswerMutation.isPending}
                            >
                              Submit Answer
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setAnsweringQuestionId(null)
                                setAnswerText('')
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </form>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setAnsweringQuestionId(question.id)}
                          className="mt-2"
                        >
                          Answer this question
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No questions yet. Be the first to ask about this product!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
