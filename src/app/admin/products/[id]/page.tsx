'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Loader2, Plus, Save, Trash2, X } from 'lucide-react'
import Link from 'next/link'
import { notFound, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

interface ProductVariant {
  id: string
  name: string
  value: string
  price: number | null
  stock: number
  sku: string | null
  productId: string
  createdAt: string
  updatedAt: string
}

interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  comparePrice: number | null
  stock: number
  images: string[]
  featured: boolean
  active: boolean
  rating: number
  reviewCount: number
  categoryId: string
  subcategoryId: string | null
  category: { id: string; name: string; slug: string } | null
  subcategory: { id: string; name: string; slug: string } | null
  variants: ProductVariant[]
  createdAt: string
  updatedAt: string
}

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState<{
    name: string
    description: string
    price: number
    comparePrice: number | null
    stock: number
    categoryId: string
    subcategoryId: string | null
    featured: boolean
    active: boolean
    images: string[]
    variants: Array<{
      id?: string
      name: string
      value: string
      price: number
      stock: number
      sku?: string
    }>
  }>({
    name: '',
    description: '',
    price: 0,
    comparePrice: null,
    stock: 0,
    categoryId: '',
    subcategoryId: null,
    featured: false,
    active: true,
    images: [],
    variants: []
  })

  // Fetch categories and subcategories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await fetch('/api/categories?include=subcategories')
      if (!response.ok) {
        throw new Error('Failed to fetch categories')
      }
      return response.json()
    },
  })

  // Fetch product data
  const { data: product, isLoading, isError } = useQuery<Product>({
    queryKey: ['admin-product', params.id],
    queryFn: async () => {
      const response = await fetch(`/api/admin/products/${params.id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch product')
      }
      return response.json()
    },
  })

  // Update form data when product is loaded
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price,
        comparePrice: product.comparePrice,
        stock: product.stock,
        categoryId: product.category?.id || '',
        subcategoryId: product.subcategory?.id || null,
        featured: product.featured,
        active: product.active,
        images: product.images,
        variants: product.variants?.map(variant => ({
          id: variant.id,
          name: variant.name,
          value: variant.value,
          price: variant.price || 0,
          stock: variant.stock,
          sku: variant.sku || ''
        })) || []
      })
    }
  }, [product])

  const updateProduct = async (data: typeof formData) => {
    const response = await fetch(`/api/admin/products/${params.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to update product')
    }
    
    return response.json()
  }

  const { mutate: updateProductMutation, isPending } = useMutation({
    mutationFn: updateProduct,
    onSuccess: () => {
      toast.success('Product updated successfully')
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      queryClient.invalidateQueries({ queryKey: ['admin-product', params.id] })
      router.push('/admin/products')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update product')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateProductMutation(formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' 
        ? parseFloat(value) 
        : type === 'checkbox' 
          ? (e.target as HTMLInputElement).checked 
          : value
    }))
  }

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const formData = new FormData()
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i])
    }

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) throw new Error('Failed to upload images')
      
      const { urls } = await response.json()
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...urls]
      }))
    } catch (error) {
      toast.error('Failed to upload images')
    }
  }

  // Handle variant changes
  const handleVariantChange = (index: number, field: string, value: string | number) => {
    setFormData(prev => {
      const newVariants = [...prev.variants]
      newVariants[index] = { ...newVariants[index], [field]: value }
      return { ...prev, variants: newVariants }
    })
  }

  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [
        ...prev.variants,
        { name: '', value: '', price: 0, stock: 0, sku: '' }
      ]
    }))
  }

  const removeVariant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (isError || !product) {
    return notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Edit Product</h1>
          <p className="text-muted-foreground">Update product details</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/products" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </Link>
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter product name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter product description"
                rows={5}
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Product Images</Label>
              <div className="flex flex-wrap gap-4">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Product ${index + 1}`}
                      className="h-24 w-24 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        images: prev.images.filter((_, i) => i !== index)
                      }))}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <label className="flex h-24 w-24 items-center justify-center rounded-md border-2 border-dashed border-gray-300 cursor-pointer">
                  <Plus className="h-6 w-6 text-gray-400" />
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (৳)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="comparePrice">Compare at Price (৳)</Label>
                <Input
                  id="comparePrice"
                  name="comparePrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.comparePrice || ''}
                  onChange={handleChange}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  name="stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={handleChange}
                  placeholder="0"
                  required
                />
              </div>

              {/* Category and Subcategory */}
              <div className="space-y-2">
                <Label htmlFor="categoryId">Category</Label>
                <select
                  id="categoryId"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="">Select a category</option>
                  {categories?.map((category: any) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subcategoryId">Subcategory (Optional)</Label>
                <select
                  id="subcategoryId"
                  name="subcategoryId"
                  value={formData.subcategoryId || ''}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select a subcategory</option>
                  {categories
                    ?.find((c: any) => c.id === formData.categoryId)
                    ?.subcategories?.map((subcategory: any) => (
                      <option key={subcategory.id} value={subcategory.id}>
                        {subcategory.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="featured"
                  name="featured"
                  checked={formData.featured}
                  onChange={(e) => 
                    setFormData(prev => ({ ...prev, featured: e.target.checked }))
                  }
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <Label htmlFor="featured" className="text-sm font-medium">
                  Featured Product
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="active"
                  name="active"
                  checked={formData.active}
                  onChange={(e) => 
                    setFormData(prev => ({ ...prev, active: e.target.checked }))
                  }
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <Label htmlFor="active" className="text-sm font-medium">
                  Active
                </Label>
              </div>
            </div>
          </div>
        </div>

        {/* Product Variants */}
        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Product Variants</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addVariant}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Variant
            </Button>
          </div>

          {formData.variants.length > 0 && (
            <div className="space-y-4">
              {formData.variants.map((variant, index) => (
                <div key={variant.id || index} className="border rounded-md p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Variant {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeVariant(index)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>Name (e.g., Size, Color)</Label>
                      <Input
                        value={variant.name}
                        onChange={(e) => handleVariantChange(index, 'name', e.target.value)}
                        placeholder="e.g., Size"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Value</Label>
                      <Input
                        value={variant.value}
                        onChange={(e) => handleVariantChange(index, 'value', e.target.value)}
                        placeholder="e.g., Large"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Additional Price (৳)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={variant.price}
                        onChange={(e) => handleVariantChange(index, 'price', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Stock</Label>
                      <Input
                        type="number"
                        min="0"
                        value={variant.stock}
                        onChange={(e) => handleVariantChange(index, 'stock', parseInt(e.target.value) || 0)}
                        placeholder="0"
                        required
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>SKU (Optional)</Label>
                      <Input
                        value={variant.sku || ''}
                        onChange={(e) => handleVariantChange(index, 'sku', e.target.value)}
                        placeholder="SKU-001"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <Button type="button" variant="outline" onClick={() => router.push('/admin/products')}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Update Product
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
