'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, ThumbsUp } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

type Review = {
  id: string
  rating: number
  title: string | null
  comment: string
  verified: boolean
  helpful: number
  approved: boolean
  createdAt: string
  user: {
    name: string
  } | null
}

export function ProductReviews({ productId }: { productId: string }) {
  const [isWritingReview, setIsWritingReview] = useState(false)
  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const queryClient = useQueryClient()
  const router = useRouter()

  const {
    data: reviews = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['reviews', productId],
    queryFn: async () => {
      const response = await fetch(`/api/reviews?productId=${productId}`)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to fetch reviews')
      }
      return response.json() as Promise<Review[]>
    },
    retry: 2,
    retryDelay: 1000,
  })

  const createReviewMutation = useMutation({
    mutationFn: async (data: {
      productId: string
      rating: number
      title: string
      comment: string
    }) => {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const error = new Error(errorData.error || 'Failed to submit review')
        // Add status code to error for better handling
        ;(error as any).status = response.status
        throw error
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] })
      setIsWritingReview(false)
      setRating(5)
      setTitle('')
      setComment('')
      toast.success('Review submitted! It will be visible after approval.')
      router.refresh()
    },
    onError: (error: any) => {
      if (error.status === 401) {
        toast.error('Please log in to submit a review')
        router.push('/login')
      } else if (error.status === 409) {
        toast.error('You have already reviewed this product')
      } else {
        toast.error(
          error.message || 'Failed to submit review. Please try again.'
        )
      }
    },
  })

  const markHelpfulMutation = useMutation({
    mutationFn: async ({ id, helpful }: { id: string; helpful: number }) => {
      const response = await fetch(`/api/reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ helpful: helpful + 1 }),
      })
      if (!response.ok) throw new Error('Failed to mark as helpful')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] })
    },
  })

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim()) {
      toast.error('Please write your review')
      return
    }
    createReviewMutation.mutate({ productId, rating, title, comment })
  }

  const ratingDistribution = reviews.reduce((acc, review) => {
    acc[review.rating] = (acc[review.rating] || 0) + 1
    return acc
  }, {} as Record<number, number>)

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Customer Reviews</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Rating Summary */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="text-center space-y-2">
              <div className="text-5xl font-bold">
                {averageRating.toFixed(1)}
              </div>
              <div className="flex items-center justify-center gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= averageRating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
              </p>
            </div>

            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map(stars => (
                <div key={stars} className="flex items-center gap-2">
                  <span className="text-sm w-12">{stars} star</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{
                        width: `${
                          reviews.length > 0
                            ? ((ratingDistribution[stars] || 0) /
                                reviews.length) *
                              100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                  <span className="text-sm w-12 text-right">
                    {ratingDistribution[stars] || 0}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Write Review Button */}
          {!isWritingReview && (
            <Button onClick={() => setIsWritingReview(true)} className="w-full">
              Write a Review
            </Button>
          )}

          {/* Review Form */}
          {isWritingReview && (
            <form
              onSubmit={handleSubmitReview}
              className="space-y-4 border-t pt-4"
            >
              <div className="space-y-2">
                <Label>Your Rating</Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Button
                      key={star}
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setRating(star)}
                      className="h-10 w-10"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          star <= rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="review-title">Review Title (Optional)</Label>
                <Input
                  id="review-title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Summarize your experience"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="review-comment">Your Review *</Label>
                <Textarea
                  id="review-comment"
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Share your experience with this product..."
                  rows={5}
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={createReviewMutation.isPending}
                  className="flex-1"
                >
                  Submit Review
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsWritingReview(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {/* Reviews List */}
          {isLoading ? (
            <p className="text-center py-4">Loading reviews...</p>
          ) : isError ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-2">Failed to load reviews</p>
              <p className="text-sm text-muted-foreground mb-4">
                {error instanceof Error ? error.message : 'An error occurred'}
              </p>
              <Button
                variant="outline"
                onClick={() =>
                  queryClient.invalidateQueries({
                    queryKey: ['reviews', productId],
                  })
                }
              >
                Try Again
              </Button>
            </div>
          ) : reviews.length > 0 ? (
            <div className="space-y-4 border-t pt-4">
              {reviews.map(review => (
                <div key={review.id} className="border-b pb-4 last:border-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        {review.verified && (
                          <Badge variant="outline" className="text-xs">
                            Verified Purchase
                          </Badge>
                        )}
                      </div>
                      {review.title && (
                        <h4 className="font-semibold">{review.title}</h4>
                      )}
                      <p className="text-sm">{review.comment}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>
                          By {review.user?.name || 'Anonymous'} on{' '}
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            markHelpfulMutation.mutate({
                              id: review.id,
                              helpful: review.helpful,
                            })
                          }
                          className="flex items-center gap-1 hover:text-foreground"
                        >
                          <ThumbsUp className="h-3 w-3" />
                          Helpful ({review.helpful})
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No reviews yet. Be the first to review this product!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
