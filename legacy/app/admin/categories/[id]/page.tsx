'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { LoaderFullScreen } from '@/components/ui/loader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import ImageUpload from '@/components/ImageUpload'
import { FormActionBar, type FormState } from '@/components/form-action-bar'
import Link from 'next/link'

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  image: z.string().optional(),
})

type CategoryFormValues = z.infer<typeof categorySchema>

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
}

// API functions
const fetchCategory = async (id: string): Promise<Category> => {
  const res = await fetch(`/api/admin/categories/${id}`)
  if (!res.ok) throw new Error('Failed to fetch category')
  return res.json()
}

const createCategory = async (data: CategoryFormValues): Promise<Category> => {
  const res = await fetch('/api/admin/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create category')
  return res.json()
}

const updateCategory = async ({
  id,
  data,
}: {
  id: string
  data: CategoryFormValues
}): Promise<Category> => {
  const res = await fetch(`/api/admin/categories/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update category')
  return res.json()
}

export default function CategoryFormPage() {
  const router = useRouter()
  const params = useParams()
  const queryClient = useQueryClient()
  const isEdit = params.id !== 'new'
  const categoryId = isEdit ? (params.id as string) : null

  const [formState, setFormState] = useState<FormState>('idle')
  const [statusMessage, setStatusMessage] = useState<string>('')
  const [savedFormData, setSavedFormData] = useState<CategoryFormValues | null>(
    null
  )

  // Fetch category if editing
  const { data: category, isLoading: isFetching } = useQuery({
    queryKey: ['category', categoryId],
    queryFn: () => fetchCategory(categoryId!),
    enabled: isEdit && !!categoryId,
  })

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      image: '',
    },
  })

  // Initialize savedFormData for new categories
  useEffect(() => {
    if (!isEdit && !savedFormData) {
      setSavedFormData({
        name: '',
        slug: '',
        description: '',
        image: '',
      })
    }
  }, [isEdit, savedFormData])

  // Update form when category data is loaded
  useEffect(() => {
    if (category) {
      const formData = {
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        image: category.image || '',
      }
      form.reset(formData)
      setSavedFormData(formData)
      setFormState('idle')
    }
  }, [category, form])

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
    mutationFn: createCategory,
    onMutate: () => {
      setFormState('loading')
      setStatusMessage('Saving category...')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      setStatusMessage('Category added successfully!')
      setFormState('success')
      setTimeout(() => {
        router.push('/admin/categories')
      }, 1500)
    },
    onError: () => {
      setStatusMessage('Failed to save category. Please try again.')
      setFormState('error')
    },
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: updateCategory,
    onMutate: () => {
      setFormState('loading')
      setStatusMessage('Updating category...')
    },
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['category', categoryId] })
      setStatusMessage('Category updated successfully!')
      const newFormData = {
        name: data.name,
        slug: data.slug,
        description: data.description || '',
        image: data.image || '',
      }
      setSavedFormData(newFormData)
      setFormState('success')
    },
    onError: () => {
      setStatusMessage('Failed to update category. Please try again.')
      setFormState('error')
    },
  })

  // Auto-generate slug from name
  const handleNameChange = (value: string) => {
    form.setValue('name', value, { shouldDirty: true })
    if (!isEdit) {
      const slug = value
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]/g, '')
      form.setValue('slug', slug, { shouldDirty: true })
    }
  }

  const onSave = async () => {
    const isValid = await form.trigger()
    if (!isValid) {
      setStatusMessage('Form has errors. Please correct them.')
      setFormState('error')
      return
    }

    const data = form.getValues()
    if (isEdit && categoryId) {
      updateMutation.mutate({ id: categoryId, data })
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
    return <LoaderFullScreen text="Loading category..." />
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/categories">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {isEdit ? 'Edit Category' : 'New Category'}
          </h1>
          <p className="text-muted-foreground">
            {isEdit ? 'Update category information' : 'Create a new category'}
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Category Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        onChange={e => handleNameChange(e.target.value)}
                        placeholder="Electronics"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="electronics" />
                    </FormControl>
                    <FormDescription>
                      URL-friendly name (auto-generated from name)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Category description..."
                        rows={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Image</FormLabel>
                    <FormControl>
                      <ImageUpload
                        images={field.value ? [field.value] : []}
                        onChange={urls => field.onChange(urls[0] || '')}
                        maxImages={1}
                        label="Upload Category Image"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>
      </Card>
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
  )
}
