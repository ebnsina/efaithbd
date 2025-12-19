'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Edit, Loader2, MoreVertical, Plus, Search, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  createdAt: string
}

// API functions
const fetchCategories = async (): Promise<Category[]> => {
  const res = await fetch('/api/admin/categories')
  if (!res.ok) throw new Error('Failed to fetch categories')
  return res.json()
}

const deleteCategory = async (id: string): Promise<void> => {
  const res = await fetch(`/api/admin/categories/${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) throw new Error('Failed to delete category')
}

export default function CategoriesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const router = useRouter()
  const queryClient = useQueryClient()

  // Fetch categories query
  const {
    data: categories = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Delete Success')
      setDeleteId(null)
    },
    onError: () => {
      toast.error('Delete Error')
      setDeleteId(null)
    },
  })

  const handleDelete = async (id: string) => {
    setDeleteId(id)
  }

  const confirmDelete = async () => {
    if (!deleteId) return
    deleteMutation.mutate(deleteId)
  }

  const filteredCategories = categories.filter(
    cat =>
      cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.slug.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {'Manage Categories'}
          </h1>
          <p className="text-muted-foreground mt-2">
            Create and manage categories
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/categories/new">
            <Plus className="h-4 w-4" />
            {'Add New'}
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder={'Search Categories'}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Categories Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center h-64 text-center p-4">
                <p className="text-destructive font-medium mb-2">
                  Failed to load data
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  {error instanceof Error ? error.message : 'Unknown error'}
                </p>
                <Button
                  variant="outline"
                  onClick={() =>
                    queryClient.invalidateQueries({
                      queryKey: ['categories'],
                    })
                  }
                >
                  Try Again
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No categories found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCategories.map(category => (
                      <TableRow key={category.id}>
                        <TableCell>
                          {category.image ? (
                            <img
                              src={category.image}
                              alt={category.name}
                              className="h-16 w-16 rounded-md border object-cover"
                            />
                          ) : (
                            <div className="flex h-16 w-16 items-center justify-center rounded-md border bg-muted">
                              <span className="text-xs text-muted-foreground">
                                No Image
                              </span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <span className="font-medium">{category.name}</span>
                            {category.description && (
                              <span className="text-sm text-muted-foreground line-clamp-1">
                                {category.description}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="rounded bg-muted px-2 py-1 text-sm">
                            {category.slug}
                          </code>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(category.createdAt).toLocaleDateString(
                            'en-US',
                            {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            }
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  router.push(
                                    `/admin/categories/${category.id}`
                                  )
                                }
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDelete(category.id)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This category will be permanently deleted. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
