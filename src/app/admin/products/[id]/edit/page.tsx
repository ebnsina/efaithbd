'use client'

import { useEffect, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter, useParams } from 'next/navigation'
import { Loader2, ArrowLeft, Plus, X } from 'lucide-react'
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
import { Switch } from '@/components/ui/switch'
import ImageUpload from '@/components/ImageUpload'
import { FormActionBar, type FormState } from '@/components/form-action-bar'
import Link from 'next/link'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const productVariantSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Variant name is required'),
  value: z.string().min(1, 'Value is required'),
  price: z.number().nullable(),
  stock: z.number().min(0, 'Stock must be 0 or greater'),
  sku: z.string().optional(),
})

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().min(0, 'Price must be 0 or greater'),
  comparePrice: z.number().nullable(),
  stock: z.number().min(0, 'Stock must be 0 or greater'),
  categoryId: z.string().min(1, 'Category must be selected'),
  subcategoryId: z.string().optional().nullable(),
  images: z.array(z.string()).min(1, 'At least one image must be uploaded'),
  featured: z.boolean(),
  active: z.boolean(),
  productType: z.enum(['single', 'variant']),
  variants: z.array(productVariantSchema).optional(),
})

type ProductFormValues = z.infer<typeof productSchema>

interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  comparePrice: number | null
  stock: number
  images: string[]
  featured: boolean
  active: boolean
  category: { id: string; name: string }
  subcategory?: { id: string; name: string } | null
  variants: Array<{
    id: string
    name: string
    value: string
    price: number | null
    stock: number
    sku?: string
  }>
}

interface Category {
  id: string
  name: string
  subcategories?: Array<{
    id: string
    name: string
  }>
}

// API functions
const fetchProduct = async (id: string): Promise<Product> => {
  const res = await fetch(`/api/admin/products/${id}`)
  if (!res.ok) throw new Error('Failed to fetch product')
  return res.json()
}

const fetchCategories = async (): Promise<Category[]> => {
  const res = await fetch('/api/admin/categories')
  if (!res.ok) throw new Error('Failed to fetch categories')
  return res.json()
}

const createProduct = async (data: any): Promise<Product> => {
  const res = await fetch('/api/admin/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create product')
  return res.json()
}

const updateProduct = async ({
  id,
  data,
}: {
  id: string
  data: any
}): Promise<Product> => {
  const res = await fetch(`/api/admin/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update product')
  return res.json()
}

export default function ProductFormPage() {
  const router = useRouter()
  const params = useParams()
  const queryClient = useQueryClient()
  const isEdit = params.id !== 'new'
  const productId = isEdit ? (params.id as string) : null

  const [formState, setFormState] = useState<FormState>('idle')
  const [statusMessage, setStatusMessage] = useState<string>('')
  const [savedFormData, setSavedFormData] = useState<ProductFormValues | null>(
    null
  )

  // Fetch product if editing
  const { data: product, isLoading: isFetchingProduct } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => fetchProduct(productId!),
    enabled: isEdit && !!productId,
  })

  // Fetch categories
  const { data: categories = [], isLoading: isFetchingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  })

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      price: 0,
      comparePrice: null,
      stock: 0,
      categoryId: '',
      subcategoryId: null,
      images: [],
      featured: false,
      active: true,
      productType: 'single',
      variants: [],
    },
  })

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: 'variants',
  })

  const productType = form.watch('productType')
  const categoryId = form.watch('categoryId')
  const selectedCategory = categories.find(c => c.id === categoryId)

  // Initialize savedFormData for new products
  useEffect(() => {
    if (!isEdit && !savedFormData) {
      setSavedFormData({
        name: '',
        slug: '',
        description: '',
        price: 0,
        comparePrice: null,
        stock: 0,
        categoryId: '',
        subcategoryId: null,
        images: [],
        featured: false,
        active: true,
        productType: 'single',
        variants: [],
      })
    }
  }, [isEdit, savedFormData])

  // Update form when product data is loaded
  useEffect(() => {
    if (product && isEdit) {
      const mappedVariants = product.variants.map(v => ({
        id: v.id,
        name: v.name,
        value: v.value,
        price: v.price,
        stock: v.stock,
        sku: v.sku || undefined,
      }))
      
      const formData: ProductFormValues = {
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        comparePrice: product.comparePrice,
        stock: product.stock,
        categoryId: product.category.id,
        subcategoryId: product.subcategory?.id || null,
        images: product.images,
        featured: product.featured,
        active: product.active,
        productType: product.variants.length > 0 ? 'variant' : 'single',
        variants: mappedVariants,
      }
      
      // Replace field array first to ensure proper initialization
      // This must happen before form.reset to avoid field array sync issues
      if (mappedVariants.length > 0) {
        replace(mappedVariants)
      } else {
        replace([])
      }
      
      // Then reset the form with all data
      form.reset(formData, { keepDefaultValues: false })
      
      // Explicitly set productType to ensure Select component updates properly
      // This is needed because Select component might not update on form.reset alone
      form.setValue('productType', formData.productType, { shouldDirty: false })
      
      setSavedFormData(formData)
      setFormState('idle')
    }
  }, [product, form, isEdit, replace])

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
    mutationFn: createProduct,
    onMutate: () => {
      setFormState('loading')
      setStatusMessage('Saving product...')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      setStatusMessage('Product created successfully!')
      setFormState('success')
      setTimeout(() => {
        router.push('/admin/products')
      }, 1500)
    },
    onError: () => {
      setStatusMessage('Failed to save product. Please try again.')
      setFormState('error')
    },
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: updateProduct,
    onMutate: () => {
      setFormState('loading')
      setStatusMessage('Updating product...')
    },
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['product', productId] })
      setStatusMessage('Product updated successfully!')
      const newFormData: ProductFormValues = {
        name: data.name,
        slug: data.slug,
        description: data.description,
        price: data.price,
        comparePrice: data.comparePrice,
        stock: data.stock,
        categoryId: data.category.id,
        subcategoryId: data.subcategory?.id || null,
        images: data.images,
        featured: data.featured,
        active: data.active,
        productType: data.variants.length > 0 ? 'variant' : 'single',
        variants: data.variants,
      }
      setSavedFormData(newFormData)
      setFormState('success')
    },
    onError: () => {
      setStatusMessage('Failed to update product. Please try again.')
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
      setStatusMessage('Form has errors. Please fix them.')
      setFormState('error')
      return
    }

    const data = form.getValues()
    if (isEdit && productId) {
      updateMutation.mutate({ id: productId, data })
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

  if (isFetchingCategories || (isEdit && isFetchingProduct)) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (isEdit && !product) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-muted-foreground">Product not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/products">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEdit ? 'Edit Product' : 'New Product'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isEdit ? 'Update product information' : 'Create a new product'}
          </p>
        </div>
      </div>

      {/* Form */}
      <Form {...form} key={productId || 'new'}>
        <form className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                        placeholder="Smartphone"
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
                      <Input {...field} placeholder="smartphone" />
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
                        placeholder="Product description..."
                        rows={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Category */}
          <Card>
            <CardHeader>
              <CardTitle>Category</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={(value: string) => {
                        field.onChange(value)
                        form.setValue('subcategoryId', null)
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedCategory?.subcategories &&
                selectedCategory.subcategories.length > 0 && (
                  <FormField
                    control={form.control}
                    name="subcategoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subcategory (Optional)</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || undefined}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select subcategory" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {selectedCategory.subcategories?.map(subcat => (
                              <SelectItem key={subcat.id} value={subcat.id}>
                                {subcat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
            </CardContent>
          </Card>

          {/* Product Type */}
          <Card>
            <CardHeader>
              <CardTitle>Product Type</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="productType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Product Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select product type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="single">
                          Single Product (No Variants)
                        </SelectItem>
                        <SelectItem value="variant">
                          Product with Variants
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Pricing & Stock (for single products) */}
          {productType === 'single' && (
            <Card>
              <CardHeader>
                <CardTitle>Pricing & Stock</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price (৳)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            value={field.value || ''}
                            onChange={e =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="comparePrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Compare Price (৳)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            value={field.value || ''}
                            onChange={e =>
                              field.onChange(
                                e.target.value
                                  ? parseFloat(e.target.value)
                                  : null
                              )
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          Optional - Previous price
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock Quantity</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          value={field.value || ''}
                          onChange={e =>
                            field.onChange(parseInt(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {/* Variants (for variant products) */}
          {productType === 'variant' && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Variants</CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      append({
                        name: '',
                        value: '',
                        price: null,
                        stock: 0,
                        sku: '',
                      })
                    }
                  >
                    <Plus className="h-4 w-4" />
                    Add Variant
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Base price for variant products */}
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base Price (৳)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          value={field.value || ''}
                          onChange={e =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Base price for the product. Variants can have additional
                        price adjustments.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {fields.map((field, index) => (
                  <Card key={field.id}>
                    <CardContent className="pt-6 space-y-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">Variant #{index + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <FormField
                        control={form.control}
                        name={`variants.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g., Size, Color" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`variants.${index}.value`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Value</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g., Large, Red" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name={`variants.${index}.price`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Additional Price (৳)</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="number"
                                  value={field.value || ''}
                                  onChange={e =>
                                    field.onChange(
                                      e.target.value
                                        ? parseFloat(e.target.value)
                                        : null
                                    )
                                  }
                                />
                              </FormControl>
                              <FormDescription>
                                Optional - Additional price on top of base price
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`variants.${index}.stock`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Stock</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="number"
                                  value={field.value || ''}
                                  onChange={e =>
                                    field.onChange(
                                      parseInt(e.target.value) || 0
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`variants.${index}.sku`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>SKU</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="SKU-001" />
                              </FormControl>
                              <FormDescription>Optional</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {fields.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No variants added yet. Click &quot;Add Variant&quot; to add
                    one.
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="images"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Images</FormLabel>
                    <FormControl>
                      <ImageUpload
                        images={field.value || []}
                        onChange={field.onChange}
                        maxImages={5}
                        label="Upload product images (max 5)"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Featured Product
                      </FormLabel>
                      <FormDescription>
                        Display in featured section on homepage?
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active</FormLabel>
                      <FormDescription>
                        Display this product on the site?
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
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
        saveLabel="Save"
        dirtyMessage="Warning — Your changes are not saved!"
        loadingMessage={statusMessage}
        successMessage={statusMessage}
        errorMessage={statusMessage}
      />
    </div>
  )
}
