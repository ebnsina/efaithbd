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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Check,
  X,
  Trash2,
  Star,
  ExternalLink,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { useConfirm } from '@/hooks/use-confirm'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { toast } from 'sonner'
import Link from 'next/link'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type Review = {
  id: string
  productId: string
  userId: string | null
  rating: number
  title: string | null
  comment: string
  verified: boolean
  helpful: number
  approved: boolean
  createdAt: string
  updatedAt: string
  product: {
    id: string
    name: string
    slug: string
  }
  user: {
    name: string | null
    email: string
  } | null
}

export default function AdminReviewsPage() {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [ratingFilter, setRatingFilter] = useState<string>('all')
  const confirmDialog = useConfirm()

  const { data: reviews = [], isLoading } = useQuery<Review[]>({
    queryKey: ['admin-reviews'],
    queryFn: async () => {
      const res = await fetch('/api/admin/reviews')
      if (!res.ok) throw new Error('Failed to fetch reviews')
      return res.json()
    },
  })

  const updateReviewMutation = useMutation({
    mutationFn: async ({ id, approved }: { id: string; approved: boolean }) => {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved }),
      })
      if (!res.ok) throw new Error('Failed to update review')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] })
      toast.success('Review updated successfully')
    },
    onError: () => {
      toast.error('Failed to update review')
    },
  })

  const deleteReviewMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete review')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] })
      toast.success('Review deleted successfully')
    },
    onError: () => {
      toast.error('Failed to delete review')
    },
  })

  const handleApprove = async (review: Review) => {
    const confirmed = await confirmDialog.confirm({
      title: 'Approve Review',
      description: 'Are you sure you want to approve this review?',
    })
    if (confirmed) {
      updateReviewMutation.mutate({ id: review.id, approved: true })
    }
  }

  const handleReject = async (review: Review) => {
    const confirmed = await confirmDialog.confirm({
      title: 'Reject Review',
      description: 'Are you sure you want to reject this review?',
    })
    if (confirmed) {
      updateReviewMutation.mutate({ id: review.id, approved: false })
    }
  }

  const handleDelete = async (review: Review) => {
    const confirmed = await confirmDialog.confirm({
      title: 'Delete Review',
      description:
        'Are you sure you want to delete this review? This action cannot be undone.',
    })
    if (confirmed) {
      deleteReviewMutation.mutate(review.id)
    }
  }

  const filteredReviews = reviews.filter(review => {
    if (statusFilter === 'approved' && !review.approved) return false
    if (statusFilter === 'pending' && review.approved) return false
    if (ratingFilter !== 'all' && review.rating !== Number(ratingFilter))
      return false
    return true
  })

  const stats = {
    total: reviews.length,
    approved: reviews.filter(r => r.approved).length,
    pending: reviews.filter(r => !r.approved).length,
    avgRating:
      reviews.length > 0
        ? (
            reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          ).toFixed(1)
        : '0',
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reviews</h1>
          <p className="text-muted-foreground">
            Manage product reviews and ratings
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Approved Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.approved}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Pending Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.pending}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Average Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{stats.avgRating}</div>
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>All Reviews</CardTitle>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                  <SelectItem value="2">2 Stars</SelectItem>
                  <SelectItem value="1">1 Star</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading reviews...</div>
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Star className="w-12 h-12 text-muted-foreground mb-2" />
              <div className="text-muted-foreground">No reviews found</div>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Review</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReviews.map(review => (
                    <TableRow key={review.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="font-medium line-clamp-1">
                              {review.product.name}
                            </div>
                            <Link
                              href={`/products/${review.product.slug}`}
                              target="_blank"
                              className="text-xs text-primary hover:underline flex items-center gap-1"
                            >
                              View Product
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {review.user?.name || 'Guest'}
                          </div>
                          {review.verified && (
                            <Badge variant="secondary" className="text-xs mt-1">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verified Purchase
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        {review.title && (
                          <div className="font-medium text-sm mb-1 line-clamp-1">
                            {review.title}
                          </div>
                        )}
                        <div className="text-sm text-muted-foreground line-clamp-2">
                          {review.comment}
                        </div>
                      </TableCell>
                      <TableCell>
                        {review.approved ? (
                          <Badge
                            variant="secondary"
                            className="bg-green-100 text-green-700"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Approved
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="bg-orange-100 text-orange-700"
                          >
                            <XCircle className="w-3 h-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          {!review.approved ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApprove(review)}
                              disabled={updateReviewMutation.isPending}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReject(review)}
                              disabled={updateReviewMutation.isPending}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(review)}
                            disabled={deleteReviewMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.options.title}
        description={confirmDialog.options.description}
        confirmText={confirmDialog.options.confirmText}
        cancelText={confirmDialog.options.cancelText}
        onConfirm={confirmDialog.handleConfirm}
        onCancel={confirmDialog.handleCancel}
      />
    </div>
  )
}
