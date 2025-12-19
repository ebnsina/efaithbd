'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter, useParams } from 'next/navigation'
import { Loader2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import ImageUpload from '@/components/ImageUpload'
import { FormActionBar, type FormState } from '@/components/form-action-bar'
import Link from 'next/link'

const bannerSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  image: z.string().min(1, 'Image is required'),
  link: z.string().optional(),
  order: z.number(),
  active: z.boolean(),
})

type BannerFormValues = z.infer<typeof bannerSchema>

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
const fetchBanner = async (id: string): Promise<Banner> => {
  const res = await fetch(`/api/admin/banners/${id}`)
  if (!res.ok) throw new Error('Failed to fetch banner')
  return res.json()
}

const createBanner = async (data: BannerFormValues): Promise<Banner> => {
  const res = await fetch('/api/admin/banners', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create banner')
  return res.json()
}

const updateBanner = async ({
  id,
  data,
}: {
  id: string
  data: BannerFormValues
}): Promise<Banner> => {
  const res = await fetch(`/api/admin/banners/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update banner')
  return res.json()
}

export default function BannerFormPage() {
  const router = useRouter()
  const params = useParams()
  const queryClient = useQueryClient()
  const isEdit = params.id !== 'new'
  const bannerId = isEdit ? (params.id as string) : null

  const [formState, setFormState] = useState<FormState>('idle')
  const [statusMessage, setStatusMessage] = useState<string>('')
  const [savedFormData, setSavedFormData] = useState<BannerFormValues | null>(
    null
  )

  // Fetch banner if editing
  const { data: banner, isLoading: isFetching } = useQuery({
    queryKey: ['banner', bannerId],
    queryFn: () => fetchBanner(bannerId!),
    enabled: isEdit && !!bannerId,
  })

  const form = useForm<BannerFormValues>({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      title: '',
      subtitle: '',
      image: '',
      link: '',
      order: 0,
      active: true,
    },
  })

  // Initialize savedFormData for new banners
  useEffect(() => {
    if (!isEdit && !savedFormData) {
      setSavedFormData({
        title: '',
        subtitle: '',
        image: '',
        link: '',
        order: 0,
        active: true,
      })
    }
  }, [isEdit, savedFormData])

  // Update form when banner data is loaded
  useEffect(() => {
    if (banner) {
      const formData = {
        title: banner.title || '',
        subtitle: banner.subtitle || '',
        image: banner.image,
        link: banner.link || '',
        order: banner.order,
        active: banner.active,
      }
      form.reset(formData)
      setSavedFormData(formData)
      setFormState('idle')
    }
  }, [banner, form])

  // Watch form changes
  useEffect(() => {
    const subscription = form.watch(() => {
      if (savedFormData) {
        const currentData = form.getValues()
        const hasChanges =
          JSON.stringify(currentData) !== JSON.stringify(savedFormData)
        setFormState(hasChanges ? 'dirty' : 'idle')
      }
    })
    return () => subscription.unsubscribe()
  }, [form, savedFormData])

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createBanner,
    onMutate: () => {
      setFormState('loading')
      setStatusMessage('Saving banner...')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] })
      setStatusMessage('Banner created successfully!')
      setFormState('success')
      setTimeout(() => {
        router.push('/admin/banners')
      }, 1500)
    },
    onError: () => {
      setStatusMessage('Failed to save banner. Please try again.')
      setFormState('error')
    },
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: updateBanner,
    onMutate: () => {
      setFormState('loading')
      setStatusMessage('Updating banner...')
    },
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ['banners'] })
      queryClient.invalidateQueries({ queryKey: ['banner', bannerId] })
      setStatusMessage('Banner updated successfully!')
      const newFormData = {
        title: data.title || '',
        subtitle: data.subtitle || '',
        image: data.image,
        link: data.link || '',
        order: data.order,
        active: data.active,
      }
      setSavedFormData(newFormData)
      setFormState('success')
    },
    onError: () => {
      setStatusMessage('Failed to update banner. Please try again.')
      setFormState('error')
    },
  })

  const onSave = async () => {
    const isValid = await form.trigger()
    if (!isValid) {
      setStatusMessage('Please fix form errors before saving.')
      setFormState('error')
      return
    }

    const data = form.getValues()
    if (isEdit && bannerId) {
      updateMutation.mutate({ id: bannerId, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const handleReset = () => {
    if (savedFormData) {
      form.reset(savedFormData)
      setFormState('idle')
    }
  }

  const handleAnimationComplete = () => {
    if (formState === 'success') {
      setFormState('idle')
    } else if (formState === 'error') {
      setFormState('dirty')
    }
  }

  if (isFetching) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/banners">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {isEdit ? 'Edit Banner' : 'New Banner'}
            </h1>
            <p className="text-muted-foreground">
              {isEdit ? 'Update banner information' : 'Create a new banner'}
            </p>
          </div>
        </div>

        {/* Form */}
        <Form {...form}>
          <form className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Banner Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Image Upload */}
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Banner Image *</FormLabel>
                      <FormControl>
                        <ImageUpload
                          images={field.value ? [field.value] : []}
                          onChange={urls => field.onChange(urls[0] || '')}
                          maxImages={1}
                          label="Upload Banner Image"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Banner Title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Subtitle */}
                <FormField
                  control={form.control}
                  name="subtitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subtitle</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Banner Subtitle" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Link and Order */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="link"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Link</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="/products" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="order"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Order</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={e =>
                              field.onChange(parseInt(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Active Switch */}
                <FormField
                  control={form.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2 space-y-0">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="mt-0!">Active</FormLabel>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </form>
        </Form>

        <FormActionBar
          state={formState}
          onReset={handleReset}
          onSave={onSave}
          onAnimationComplete={handleAnimationComplete}
          resetLabel="Reset"
          saveLabel={isEdit ? 'Update' : 'Save'}
          dirtyMessage="Warning — You have unsaved changes!"
          loadingMessage={statusMessage}
          successMessage={statusMessage}
          errorMessage={statusMessage}
        />
      </div>
    </div>
  )
}
