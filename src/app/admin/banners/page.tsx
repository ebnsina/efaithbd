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
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'

interface Banner {
  id: string
  title: string | null
  subtitle: string | null
  image: string
  link: string | null
  order: number
  active: boolean
}

// API functions
const fetchBanners = async (): Promise<Banner[]> => {
  const res = await fetch('/api/admin/banners')
  if (!res.ok) throw new Error('Failed to fetch banners')
  return res.json()
}

const deleteBanner = async (id: string): Promise<void> => {
  const res = await fetch(`/api/admin/banners/${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) throw new Error('Failed to delete banner')
}

export default function BannersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const queryClient = useQueryClient()

  // Fetch banners query
  const {
    data: banners = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['banners'],
    queryFn: fetchBanners,
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteBanner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] })
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

  const filteredBanners = banners.filter(
    banner =>
      banner.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      banner.subtitle?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {'Manage Banners'}
          </h1>
          <p className="text-muted-foreground mt-2">
            Create and manage banners
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/banners/new">
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
          placeholder={'Search Banners'}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Banners Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : isError ? (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                Failed to load banners
              </div>
            ) : filteredBanners.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                No banners found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBanners.map(banner => (
                    <TableRow key={banner.id}>
                      <TableCell>
                        <div className="relative h-16 w-24 overflow-hidden rounded-md">
                          <Image
                            src={banner.image}
                            alt={banner.title || 'Banner'}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {banner.title || 'No Title'}
                          </div>
                          {banner.subtitle && (
                            <div className="text-sm text-muted-foreground">
                              {banner.subtitle}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{banner.order}</TableCell>
                      <TableCell>
                        {banner.active ? (
                          <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                            Inactive
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/banners/${banner.id}`}>
                                <Edit className="h-4 w-4" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(banner.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this banner? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
