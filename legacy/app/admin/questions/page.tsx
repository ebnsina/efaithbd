'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Check,
  X,
  Trash2,
  MessageSquare,
  ExternalLink,
  CheckCircle,
} from 'lucide-react'
import { useConfirm } from '@/hooks/use-confirm'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { toast } from 'sonner'
import Link from 'next/link'

type Answer = {
  id: string
  answer: string
  isOfficial: boolean
  approved: boolean
  createdAt: string
  user: {
    name: string
    email: string
  } | null
}

type Question = {
  id: string
  question: string
  approved: boolean
  createdAt: string
  product: {
    id: string
    name: string
    slug: string
  }
  user: {
    name: string
    email: string
  } | null
  answers: Answer[]
}

export default function QuestionsPage() {
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null
  )
  const [answerText, setAnswerText] = useState('')
  const confirmDialog = useConfirm()
  const queryClient = useQueryClient()

  const { data: allQuestions, isLoading } = useQuery({
    queryKey: ['admin-questions'],
    queryFn: async () => {
      const response = await fetch('/api/admin/questions')
      if (!response.ok) throw new Error('Failed to fetch questions')
      return response.json() as Promise<Question[]>
    },
  })

  const approveQuestionMutation = useMutation({
    mutationFn: async ({ id, approved }: { id: string; approved: boolean }) => {
      const response = await fetch(`/api/questions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved }),
      })
      if (!response.ok) throw new Error('Failed to update question')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-questions'] })
      toast.success('Question updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const deleteQuestionMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/questions/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete question')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-questions'] })
      toast.success('Question deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const createAnswerMutation = useMutation({
    mutationFn: async ({
      questionId,
      answer,
    }: {
      questionId: string
      answer: string
    }) => {
      const response = await fetch(`/api/questions/${questionId}/answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer }),
      })
      if (!response.ok) throw new Error('Failed to create answer')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-questions'] })
      setAnswerText('')
      setSelectedQuestion(null)
      toast.success('Answer posted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const approveAnswerMutation = useMutation({
    mutationFn: async ({ id, approved }: { id: string; approved: boolean }) => {
      const response = await fetch(`/api/answers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved }),
      })
      if (!response.ok) throw new Error('Failed to update answer')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-questions'] })
      toast.success('Answer updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const deleteAnswerMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/answers/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete answer')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-questions'] })
      toast.success('Answer deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const handleApproveQuestion = (id: string, approved: boolean) => {
    approveQuestionMutation.mutate({ id, approved })
  }

  const handleDeleteQuestion = async (id: string) => {
    const confirmed = await confirmDialog.confirm({
      title: 'Delete Question',
      description:
        'Are you sure you want to delete this question? This action cannot be undone.',
    })
    if (confirmed) {
      deleteQuestionMutation.mutate(id)
    }
  }

  const handleAnswerQuestion = (question: Question) => {
    setSelectedQuestion(question)
    setAnswerText('')
  }

  const handleSubmitAnswer = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedQuestion && answerText.trim()) {
      createAnswerMutation.mutate({
        questionId: selectedQuestion.id,
        answer: answerText,
      })
    }
  }

  const handleApproveAnswer = (id: string, approved: boolean) => {
    approveAnswerMutation.mutate({ id, approved })
  }

  const handleDeleteAnswer = async (id: string) => {
    const confirmed = await confirmDialog.confirm({
      title: 'Delete Answer',
      description:
        'Are you sure you want to delete this answer? This action cannot be undone.',
    })
    if (confirmed) {
      deleteAnswerMutation.mutate(id)
    }
  }

  const pendingQuestions = allQuestions?.filter(q => !q.approved) || []
  const approvedQuestions = allQuestions?.filter(q => q.approved) || []

  return (
    <>
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.options.title}
        description={confirmDialog.options.description}
        confirmText={confirmDialog.options.confirmText}
        cancelText={confirmDialog.options.cancelText}
        onConfirm={confirmDialog.handleConfirm}
        onCancel={confirmDialog.handleCancel}
      />
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Questions & Answers</h1>
          <p className="text-muted-foreground">
            Manage product questions and answers
          </p>
        </div>

        {/* Pending Questions */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Questions</CardTitle>
            <CardDescription>
              {pendingQuestions.length} questions awaiting approval
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Loading...</p>
            ) : pendingQuestions.length > 0 ? (
              <div className="space-y-4">
                {pendingQuestions.map(question => (
                  <div
                    key={question.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/products/${question.product.slug}`}
                            className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
                          >
                            {question.product.name}
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        </div>
                        <p className="font-medium">{question.question}</p>
                        <p className="text-sm text-muted-foreground">
                          Asked by {question.user?.name || 'Guest'} on{' '}
                          {new Date(question.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() =>
                            handleApproveQuestion(question.id, true)
                          }
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAnswerQuestion(question)}
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Answer
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteQuestion(question.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {question.answers.length > 0 && (
                      <div className="ml-6 space-y-2 border-l-2 pl-4">
                        {question.answers.map(answer => (
                          <div
                            key={answer.id}
                            className="bg-muted p-3 rounded space-y-2"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <p className="text-sm">{answer.answer}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {answer.user?.name || 'Guest'}
                                  {answer.isOfficial && (
                                    <Badge variant="default" className="ml-2">
                                      Official
                                    </Badge>
                                  )}
                                  {!answer.approved && (
                                    <Badge variant="secondary" className="ml-2">
                                      Pending
                                    </Badge>
                                  )}
                                </p>
                              </div>
                              <div className="flex gap-1">
                                {!answer.approved && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() =>
                                      handleApproveAnswer(answer.id, true)
                                    }
                                  >
                                    <Check className="h-3 w-3" />
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteAnswer(answer.id)}
                                >
                                  <Trash2 className="h-3 w-3 text-destructive" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No pending questions
              </p>
            )}
          </CardContent>
        </Card>

        {/* Approved Questions */}
        <Card>
          <CardHeader>
            <CardTitle>Approved Questions</CardTitle>
            <CardDescription>
              {approvedQuestions.length} approved questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Loading...</p>
            ) : approvedQuestions.length > 0 ? (
              <div className="space-y-4">
                {approvedQuestions.map(question => (
                  <div
                    key={question.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/products/${question.product.slug}`}
                            className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
                          >
                            {question.product.name}
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                          <Badge variant="outline">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Approved
                          </Badge>
                        </div>
                        <p className="font-medium">{question.question}</p>
                        <p className="text-sm text-muted-foreground">
                          Asked by {question.user?.name || 'Guest'} on{' '}
                          {new Date(question.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleApproveQuestion(question.id, false)
                          }
                        >
                          <X className="h-4 w-4 mr-1" />
                          Unapprove
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAnswerQuestion(question)}
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Answer
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteQuestion(question.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {question.answers.length > 0 && (
                      <div className="ml-6 space-y-2 border-l-2 pl-4">
                        {question.answers.map(answer => (
                          <div
                            key={answer.id}
                            className="bg-muted p-3 rounded space-y-2"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <p className="text-sm">{answer.answer}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {answer.user?.name || 'Guest'}
                                  {answer.isOfficial && (
                                    <Badge variant="default" className="ml-2">
                                      Official
                                    </Badge>
                                  )}
                                  {answer.approved && (
                                    <Badge variant="outline" className="ml-2">
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Approved
                                    </Badge>
                                  )}
                                </p>
                              </div>
                              <div className="flex gap-1">
                                {!answer.approved ? (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() =>
                                      handleApproveAnswer(answer.id, true)
                                    }
                                  >
                                    <Check className="h-3 w-3" />
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() =>
                                      handleApproveAnswer(answer.id, false)
                                    }
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteAnswer(answer.id)}
                                >
                                  <Trash2 className="h-3 w-3 text-destructive" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No approved questions yet
              </p>
            )}
          </CardContent>
        </Card>

        {/* Answer Dialog */}
        <Dialog
          open={selectedQuestion !== null}
          onOpenChange={open => !open && setSelectedQuestion(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Answer Question</DialogTitle>
              <DialogDescription>
                Provide an official answer to this customer question
              </DialogDescription>
            </DialogHeader>
            {selectedQuestion && (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded">
                  <p className="font-medium mb-2">Question:</p>
                  <p>{selectedQuestion.question}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Product: {selectedQuestion.product.name}
                  </p>
                </div>
                <form onSubmit={handleSubmitAnswer} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="answer">Your Answer *</Label>
                    <Textarea
                      id="answer"
                      value={answerText}
                      onChange={e => setAnswerText(e.target.value)}
                      placeholder="Type your answer here..."
                      rows={5}
                      required
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setSelectedQuestion(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createAnswerMutation.isPending}
                    >
                      Post Answer
                    </Button>
                  </DialogFooter>
                </form>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}
