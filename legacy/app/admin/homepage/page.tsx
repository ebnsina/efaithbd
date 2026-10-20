'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Loader2,
  Plus,
  Edit,
  Trash2,
  MoreVertical,
  LayoutGrid,
  ImageIcon,
  Star,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'

interface ProductSection {
  id: string
  title: string
  type: 'FEATURED' | 'NEW_ARRIVAL' | 'HOT_DEALS' | 'BEST_SELLING'
  order: number
  limit: number
  active: boolean
}

interface MidBanner {
  id: string
  title?: string | null
  image: string
  link?: string | null
  position: number
  active: boolean
}

interface FeatureCard {
  id: string
  title: string
  description?: string | null
  icon: string
  order: number
  active: boolean
}

export default function HomepageManagementPage() {
  // API functions for Product Sections
  const fetchSections = async (): Promise<ProductSection[]> => {
    const res = await fetch('/api/admin/product-sections')
    if (!res.ok) throw new Error('Failed to fetch sections')
    return res.json()
  }

  const deleteSection = async (id: string): Promise<void> => {
    const res = await fetch(`/api/admin/product-sections/${id}`, {
      method: 'DELETE',
    })
    if (!res.ok) throw new Error('Failed to delete section')
  }

  // API functions for Mid Banners
  const fetchMidBanners = async (): Promise<MidBanner[]> => {
    const res = await fetch('/api/admin/mid-banners')
    if (!res.ok) throw new Error('Failed to fetch mid banners')
    return res.json()
  }

  const deleteMidBanner = async (id: string): Promise<void> => {
    const res = await fetch(`/api/admin/mid-banners/${id}`, {
      method: 'DELETE',
    })
    if (!res.ok) throw new Error('Failed to delete mid banner')
  }

  // API functions for Feature Cards
  const fetchFeatureCards = async (): Promise<FeatureCard[]> => {
    const res = await fetch('/api/admin/feature-cards')
    if (!res.ok) throw new Error('Failed to fetch feature cards')
    return res.json()
  }

  const deleteFeatureCard = async (id: string): Promise<void> => {
    const res = await fetch(`/api/admin/feature-cards/${id}`, {
      method: 'DELETE',
    })
    if (!res.ok) throw new Error('Failed to delete feature card')
  }

  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteType, setDeleteType] = useState<
    'section' | 'banner' | 'feature' | null
  >(null)

  const queryClient = useQueryClient()

  // Fetch queries
  const {
    data: sections = [],
    isLoading: loadingSections,
    isError: errorSections,
  } = useQuery({
    queryKey: ['product-sections'],
    queryFn: fetchSections,
  })

  const {
    data: midBanners = [],
    isLoading: loadingBanners,
    isError: errorBanners,
  } = useQuery({
    queryKey: ['mid-banners'],
    queryFn: fetchMidBanners,
  })

  const {
    data: featureCards = [],
    isLoading: loadingFeatures,
    isError: errorFeatures,
  } = useQuery({
    queryKey: ['feature-cards'],
    queryFn: fetchFeatureCards,
  })

  // Delete mutations
  const deleteSectionMutation = useMutation({
    mutationFn: deleteSection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-sections'] })
      toast.success('Section deleted successfully')
      setDeleteId(null)
      setDeleteType(null)
    },
    onError: () => {
      toast.error('Failed to delete section')
      setDeleteId(null)
      setDeleteType(null)
    },
  })

  const deleteBannerMutation = useMutation({
    mutationFn: deleteMidBanner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mid-banners'] })
      toast.success('Banner deleted successfully')
      setDeleteId(null)
      setDeleteType(null)
    },
    onError: () => {
      toast.error('Failed to delete banner')
      setDeleteId(null)
      setDeleteType(null)
    },
  })

  const deleteFeatureMutation = useMutation({
    mutationFn: deleteFeatureCard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-cards'] })
      toast.success('Feature card deleted successfully')
      setDeleteId(null)
      setDeleteType(null)
    },
    onError: () => {
      toast.error('Failed to delete feature card')
      setDeleteId(null)
      setDeleteType(null)
    },
  })

  const handleDelete = (id: string, type: 'section' | 'banner' | 'feature') => {
    setDeleteId(id)
    setDeleteType(type)
  }

  const confirmDelete = () => {
    if (!deleteId || !deleteType) return

    if (deleteType === 'section') {
      deleteSectionMutation.mutate(deleteId)
    } else if (deleteType === 'banner') {
      deleteBannerMutation.mutate(deleteId)
    } else if (deleteType === 'feature') {
      deleteFeatureMutation.mutate(deleteId)
    }
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      FEATURED: 'Featured',
      NEW_ARRIVAL: 'New Arrival',
      HOT_DEALS: 'Hot Deals',
      BEST_SELLING: 'Best Selling',
    }
    return labels[type] || type
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Homepage Management
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage different sections of the homepage
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="sections" className="space-y-6">
        <TabsList>
          <TabsTrigger value="sections">
            <LayoutGrid className="h-4 w-4 mr-2" />
            Product Sections
          </TabsTrigger>
          <TabsTrigger value="midBanners">
            <ImageIcon className="h-4 w-4 mr-2" />
            Mid Banners
          </TabsTrigger>
          <TabsTrigger value="features">
            <Star className="h-4 w-4 mr-2" />
            Feature Cards
          </TabsTrigger>
        </TabsList>

        {/* Product Sections Tab */}
        <TabsContent value="sections" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Product Sections</h2>
              <p className="text-sm text-muted-foreground">
                Manage product sections on the homepage
              </p>
            </div>
            <Button asChild>
              <Link href="/admin/homepage/sections/new">
                <Plus className="h-4 w-4" />
                Add New
              </Link>
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              {loadingSections ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : errorSections ? (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  Failed to load sections
                </div>
              ) : sections.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                  <LayoutGrid className="h-16 w-16 mb-4 text-muted-foreground/50" />
                  <p className="text-lg font-medium">No sections found</p>
                  <p className="text-sm mt-1">Add a new section</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Order</TableHead>
                      <TableHead>Limit</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sections.map(section => (
                      <TableRow key={section.id}>
                        <TableCell className="font-medium">
                          {section.title}
                        </TableCell>
                        <TableCell>{getTypeLabel(section.type)}</TableCell>
                        <TableCell>{section.order}</TableCell>
                        <TableCell>{section.limit}</TableCell>
                        <TableCell>
                          {section.active ? (
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
                                <Link
                                  href={`/admin/homepage/sections/${section.id}`}
                                >
                                  <Edit className="h-4 w-4" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() =>
                                  handleDelete(section.id, 'section')
                                }
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mid Banners Tab */}
        <TabsContent value="midBanners" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Mid Banners</h2>
              <p className="text-sm text-muted-foreground">
                Manage mid banners on the homepage
              </p>
            </div>
            <Button asChild>
              <Link href="/admin/homepage/mid-banners/new">
                <Plus className="h-4 w-4" />
                Add New
              </Link>
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              {loadingBanners ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : errorBanners ? (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  Failed to load banners
                </div>
              ) : midBanners.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                  <ImageIcon className="h-16 w-16 mb-4 text-muted-foreground/50" />
                  <p className="text-lg font-medium">No banners found</p>
                  <p className="text-sm mt-1">Add a new banner</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Image</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {midBanners.map(banner => (
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
                        <TableCell className="font-medium">
                          {banner.title || 'No Title'}
                        </TableCell>
                        <TableCell>{banner.position}</TableCell>
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
                                <Link
                                  href={`/admin/homepage/mid-banners/${banner.id}`}
                                >
                                  <Edit className="h-4 w-4" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() =>
                                  handleDelete(banner.id, 'banner')
                                }
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Feature Cards Tab */}
        <TabsContent value="features" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Feature Cards</h2>
              <p className="text-sm text-muted-foreground">
                Manage feature cards on the homepage
              </p>
            </div>
            <Button asChild>
              <Link href="/admin/homepage/feature-cards/new">
                <Plus className="h-4 w-4" />
                Add New
              </Link>
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              {loadingFeatures ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : errorFeatures ? (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  Failed to load feature cards
                </div>
              ) : featureCards.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                  <Star className="h-16 w-16 mb-4 text-muted-foreground/50" />
                  <p className="text-lg font-medium">No feature cards found</p>
                  <p className="text-sm mt-1">Add a new feature card</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Icon</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Order</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {featureCards.map(card => (
                      <TableRow key={card.id}>
                        <TableCell>
                          <div className="text-2xl">{card.icon}</div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {card.title}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {card.description || '-'}
                        </TableCell>
                        <TableCell>{card.order}</TableCell>
                        <TableCell>
                          {card.active ? (
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
                                <Link
                                  href={`/admin/homepage/feature-cards/${card.id}`}
                                >
                                  <Edit className="h-4 w-4" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDelete(card.id, 'feature')}
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteId && !!deleteType}
        onOpenChange={() => {
          setDeleteId(null)
          setDeleteType(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this{' '}
              {deleteType === 'section'
                ? 'section'
                : deleteType === 'banner'
                ? 'banner'
                : 'feature card'}
              ? This action cannot be undone.
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
