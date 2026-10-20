import { StarIcon, ThumbsUpIcon } from '@hugeicons/core-free-icons'
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
import { Stars } from '@/features/catalog/stars'
import { formatDate, formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'
import { reviewsQuery, useCreateReview, useMarkHelpful } from './queries'
import { reviewFormSchema } from './schemas'

function ReviewForm({ productId, onDone }: { productId: string; onDone: () => void }) {
  const createReview = useCreateReview()
  const [error, setError] = useState('')
  const form = useAppForm({
    defaultValues: { rating: 0, title: '', comment: '' },
    validators: { onSubmit: reviewFormSchema },
    onSubmit: async ({ value }) => {
      setError('')
      try {
        const result = await createReview.mutateAsync({ data: { ...value, productId } })
        if (!result.ok) return setError(result.error)
        toast.success('Thanks! Your review will appear once it has been checked.')
        onDone()
      } catch {
        setError('Could not send your review. Please try again.')
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
      <form.Field name="rating">
        {(field) => {
          const show = field.state.meta.isTouched || field.form.state.submissionAttempts > 0
          return (
            <fieldset className="space-y-2">
              <legend className="font-medium text-sm">Your rating</legend>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    aria-label={`${star} star${star > 1 ? 's' : ''}`}
                    aria-pressed={field.state.value === star}
                    onClick={() => {
                      field.handleChange(star)
                      field.handleBlur()
                    }}
                    className={cn('rounded p-1 text-primary', star > field.state.value && 'text-muted-foreground/40')}
                  >
                    <HugeiconsIcon
                      icon={StarIcon}
                      className="size-7"
                      fill={star <= field.state.value ? 'currentColor' : 'none'}
                    />
                  </button>
                ))}
              </div>
              {show && <FieldError errors={field.state.meta.errors as { message?: string }[]} />}
            </fieldset>
          )
        }}
      </form.Field>
      <form.AppField name="title">
        {(field) => <field.TextField label="Title (optional)" placeholder="Sum it up in a few words" maxLength={120} />}
      </form.AppField>
      <form.AppField name="comment">
        {(field) => <field.TextareaField label="Your review" placeholder="What did you like or dislike?" rows={4} />}
      </form.AppField>
      {error && <FieldError>{error}</FieldError>}
      <div className="flex gap-2">
        <form.AppForm>
          <form.SubmitButton label="Send review" pendingLabel="Sending…" />
        </form.AppForm>
        <Button type="button" variant="outline" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

export function ProductReviews({ productId, signedIn }: { productId: string; signedIn: boolean }) {
  const reviews = useInfiniteQuery(reviewsQuery(productId))
  const markHelpful = useMarkHelpful(productId)
  const [writing, setWriting] = useState(false)
  const [thanked, setThanked] = useState<string[]>([])
  const summary = reviews.data?.pages[0]
  const rows = reviews.data?.pages.flatMap((page) => page.rows) ?? []

  if (reviews.isPending) return <Spinner className="mx-auto my-8 size-6 text-muted-foreground" />
  if (reviews.isError || !summary) {
    return (
      <div className="py-8 text-center">
        <p className="mb-3 text-muted-foreground">We couldn't load the reviews.</p>
        <Button variant="outline" onClick={() => reviews.refetch()}>
          Try again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-[12rem_1fr]">
        <div className="space-y-1 text-center md:text-left">
          <div className="font-bold text-4xl">{summary.total ? summary.average.toFixed(1) : '–'}</div>
          <Stars value={summary.average} className="text-lg" />
          <p className="text-muted-foreground text-sm">
            {summary.total === 1 ? '1 review' : `${formatNumber(summary.total)} reviews`}
          </p>
        </div>
        <ul className="space-y-1.5">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = summary.counts[stars - 1]
            return (
              <li key={stars} className="flex items-center gap-2 text-sm">
                <span className="w-12 shrink-0">{stars} star</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <span
                    className="block h-full rounded-full bg-primary"
                    style={{ width: `${summary.total ? (count / summary.total) * 100 : 0}%` }}
                  />
                </span>
                <span className="w-8 text-right text-muted-foreground">{formatNumber(count)}</span>
              </li>
            )
          })}
        </ul>
      </div>

      {!signedIn ? (
        <p className="rounded-xl border p-4 text-sm">
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>{' '}
          to write a review.
        </p>
      ) : writing ? (
        <ReviewForm productId={productId} onDone={() => setWriting(false)} />
      ) : (
        <Button onClick={() => setWriting(true)}>Write a review</Button>
      )}

      {rows.length === 0 ? (
        <p className="py-6 text-center text-muted-foreground">No reviews yet. Be the first to share what you think.</p>
      ) : (
        <ul className="divide-y">
          {rows.map((review) => (
            <li key={review.id} className="space-y-2 py-4">
              <div className="flex flex-wrap items-center gap-2">
                <Stars value={review.rating} />
                {review.verified && <Badge variant="outline">Verified purchase</Badge>}
              </div>
              {review.title && <h3 className="font-semibold">{review.title}</h3>}
              <p className="whitespace-pre-line text-sm">{review.comment}</p>
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-xs">
                <span>
                  {review.user?.name || 'A customer'} · {formatDate(review.createdAt)}
                </span>
                <button
                  type="button"
                  disabled={thanked.includes(review.id)}
                  onClick={() => {
                    setThanked((ids) => [...ids, review.id])
                    markHelpful.mutate(review.id)
                  }}
                  className="inline-flex items-center gap-1 hover:text-foreground disabled:opacity-60"
                >
                  <HugeiconsIcon icon={ThumbsUpIcon} className="size-3.5" />
                  Helpful ({formatNumber(review.helpful)})
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {reviews.hasNextPage && (
        <Button variant="outline" onClick={() => reviews.fetchNextPage()} disabled={reviews.isFetchingNextPage}>
          {reviews.isFetchingNextPage && <Spinner />}
          Show more reviews
        </Button>
      )}
    </div>
  )
}
