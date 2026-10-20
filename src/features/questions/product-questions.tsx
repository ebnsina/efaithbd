import { BubbleChatQuestionIcon, CheckmarkBadge01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'
import { useAppForm } from '@/components/form'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FieldError } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { formatDate } from '@/lib/format'
import { questionsQuery, useAnswerQuestion, useAskQuestion } from './queries'
import { answerFormSchema, questionFormSchema } from './schemas'

function AskForm({ productId, onDone }: { productId: string; onDone: () => void }) {
  const ask = useAskQuestion()
  const [error, setError] = useState('')
  const form = useAppForm({
    defaultValues: { question: '' },
    validators: { onSubmit: questionFormSchema },
    onSubmit: async ({ value }) => {
      setError('')
      try {
        const result = await ask.mutateAsync({ data: { ...value, productId } })
        if (!result.ok) return setError(result.error)
        toast.success('Thanks! Your question will appear once it has been answered or checked.')
        onDone()
      } catch {
        setError('Could not send your question. Please try again.')
      }
    },
  })
  return (
    <form
      method="post"
      noValidate
      className="space-y-4 rounded-xl border p-4"
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
    >
      <form.AppField name="question">
        {(field) => <field.TextareaField label="Your question" placeholder="Ask anything about this product" rows={3} />}
      </form.AppField>
      {error && <FieldError>{error}</FieldError>}
      <div className="flex gap-2">
        <form.AppForm>
          <form.SubmitButton label="Send question" pendingLabel="Sending…" />
        </form.AppForm>
        <Button type="button" variant="outline" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

function AnswerForm({ productId, questionId, onDone }: { productId: string; questionId: string; onDone: () => void }) {
  const answer = useAnswerQuestion(productId)
  const [error, setError] = useState('')
  const form = useAppForm({
    defaultValues: { answer: '' },
    validators: { onSubmit: answerFormSchema },
    onSubmit: async ({ value }) => {
      setError('')
      try {
        const result = await answer.mutateAsync({ data: { ...value, questionId } })
        if (!result.ok) return setError(result.error)
        toast.success(result.published ? 'Answer posted' : 'Thanks! Your answer will appear once it has been checked.')
        onDone()
      } catch {
        setError('Could not send your answer. Please try again.')
      }
    },
  })
  return (
    <form
      method="post"
      noValidate
      className="mt-2 space-y-3"
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
    >
      <form.AppField name="answer">
        {(field) => <field.TextareaField label="Your answer" rows={2} />}
      </form.AppField>
      {error && <FieldError>{error}</FieldError>}
      <div className="flex gap-2">
        <form.AppForm>
          <form.SubmitButton label="Send answer" pendingLabel="Sending…" />
        </form.AppForm>
        <Button type="button" variant="outline" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

export function ProductQuestions({ productId, signedIn }: { productId: string; signedIn: boolean }) {
  const questions = useInfiniteQuery(questionsQuery(productId))
  const [asking, setAsking] = useState(false)
  const [answering, setAnswering] = useState<string | null>(null)
  const rows = questions.data?.pages.flatMap((page) => page.rows) ?? []

  if (questions.isPending) return <Spinner className="mx-auto my-8 size-6 text-muted-foreground" />
  if (questions.isError) {
    return (
      <div className="py-8 text-center">
        <p className="mb-3 text-muted-foreground">We couldn't load the questions.</p>
        <Button variant="outline" onClick={() => questions.refetch()}>
          Try again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {!signedIn ? (
        <p className="rounded-xl border p-4 text-sm">
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>{' '}
          to ask a question.
        </p>
      ) : asking ? (
        <AskForm productId={productId} onDone={() => setAsking(false)} />
      ) : (
        <Button onClick={() => setAsking(true)}>
          <HugeiconsIcon icon={BubbleChatQuestionIcon} />
          Ask a question
        </Button>
      )}

      {rows.length === 0 ? (
        <p className="py-6 text-center text-muted-foreground">No questions yet. Ask the first one.</p>
      ) : (
        <ul className="divide-y">
          {rows.map((question) => (
            <li key={question.id} className="space-y-3 py-4">
              <div>
                <p className="font-medium">Q: {question.question}</p>
                <p className="text-muted-foreground text-xs">
                  {question.user?.name || 'A customer'} · {formatDate(question.createdAt)}
                </p>
              </div>
              {question.answers.length > 0 ? (
                <ul className="space-y-3 border-l-2 pl-4">
                  {question.answers.map((answer) => (
                    <li key={answer.id}>
                      <p className="text-sm">{answer.answer}</p>
                      <p className="mt-1 flex flex-wrap items-center gap-2 text-muted-foreground text-xs">
                        {answer.isOfficial ? (
                          <Badge>
                            <HugeiconsIcon icon={CheckmarkBadge01Icon} />
                            Store answer
                          </Badge>
                        ) : (
                          answer.user?.name || 'A customer'
                        )}
                        <span>· {formatDate(answer.createdAt)}</span>
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-sm">Not answered yet.</p>
              )}
              {signedIn &&
                (answering === question.id ? (
                  <AnswerForm productId={productId} questionId={question.id} onDone={() => setAnswering(null)} />
                ) : (
                  <Button variant="outline" size="sm" onClick={() => setAnswering(question.id)}>
                    Answer this question
                  </Button>
                ))}
            </li>
          ))}
        </ul>
      )}
      {questions.hasNextPage && (
        <Button variant="outline" onClick={() => questions.fetchNextPage()} disabled={questions.isFetchingNextPage}>
          {questions.isFetchingNextPage && <Spinner />}
          Show more questions
        </Button>
      )}
    </div>
  )
}
