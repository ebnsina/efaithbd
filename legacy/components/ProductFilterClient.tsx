'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import ProductCard from './ProductCard'
import {
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Star,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import { Label } from './ui/label'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  comparePrice: number | null
  images: string[]
  stock: number
  category: {
    id: string
    name: string
    slug: string
  }
  subcategory?: {
    id: string
    name: string
    slug: string
  } | null
}

interface Category {
  id: string
  name: string
  slug: string
}

interface SubCategory {
  id: string
  name: string
  slug: string
  category: {
    id: string
    name: string
    slug: string
  }
}

interface Filters {
  category?: string
  subcategory?: string
  search?: string
  minPrice?: string
  maxPrice?: string
  rating?: string
  sort?: string
}

interface ProductFilterClientProps {
  initialProducts: Product[]
  categories: Category[]
  subcategories: SubCategory[]
  initialFilters: Filters
}

export default function ProductFilterClient({
  initialProducts,
  categories,
  subcategories,
  initialFilters,
}: ProductFilterClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    subcategory: true,
    price: true,
    rating: true,
  })

  const [filters, setFilters] = useState<Filters>(initialFilters)
  const [priceRange, setPriceRange] = useState({
    min: initialFilters.minPrice || '',
    max: initialFilters.maxPrice || '',
  })

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12
  const totalPages = Math.ceil(initialProducts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const products = initialProducts.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filters])

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const updateURL = (newFilters: Filters) => {
    const params = new URLSearchParams()
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) params.set(key, value)
    })
    router.push(`/products?${params.toString()}`)
  }

  const handleFilterChange = (
    key: keyof Filters,
    value: string | undefined
  ) => {
    console.log('Filter change:', key, value)
    const newFilters = { ...filters, [key]: value }
    if (!value) delete newFilters[key]
    console.log('New filters:', newFilters)
    setFilters(newFilters)
    updateURL(newFilters)
  }

  const handlePriceFilter = () => {
    const newFilters = { ...filters }
    if (priceRange.min) newFilters.minPrice = priceRange.min
    else delete newFilters.minPrice
    if (priceRange.max) newFilters.maxPrice = priceRange.max
    else delete newFilters.maxPrice
    setFilters(newFilters)
    updateURL(newFilters)
  }

  const clearFilters = () => {
    setFilters({})
    setPriceRange({ min: '', max: '' })
    router.push('/products')
  }

  const activeFiltersCount = Object.keys(filters).filter(
    key => filters[key as keyof Filters]
  ).length

  const filteredSubcategories = filters.category
    ? subcategories.filter(sub => sub.category.slug === filters.category)
    : subcategories

  // Get price range from products
  const prices = products.map(p => p.price)
  const minProductPrice = Math.min(...prices) || 0
  const maxProductPrice = Math.max(...prices) || 10000

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {'All Products'}
            </h1>
            <p className="text-gray-600">
              {initialProducts.length} {'Products Found'}
            </p>
          </div>

          {/* Sort - Desktop */}
          <div className="hidden md:flex items-center gap-4">
            {/* Sort Dropdown */}
            <select
              value={filters.sort || ''}
              onChange={e =>
                handleFilterChange('sort', e.target.value || undefined)
              }
              className="px-4 py-2 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">{'Sort Newest'}</option>
              <option value="price-asc">{'Sort Price Low High'}</option>
              <option value="price-desc">{'Sort Price High Low'}</option>
              <option value="rating">{'Sort Rating'}</option>
              <option value="name-asc">{'Sort Name A Z'}</option>
            </select>
          </div>

          {/* Mobile Filter Button */}
          <Button
            onClick={() => setShowMobileFilters(true)}
            className="md:hidden flex items-center gap-2"
          >
            <SlidersHorizontal className="w-5 h-5" />
            {'Filters'}
            {activeFiltersCount > 0 && (
              <span className="bg-white text-primary rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                {activeFiltersCount}
              </span>
            )}
          </Button>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-20">
              {/* Filter Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-bold text-gray-900">
                    {'Filters'}
                  </h2>
                </div>
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-sm text-primary hover:text-primary/80 font-medium h-auto p-0"
                  >
                    {'Cancel'}
                  </Button>
                )}
              </div>

              {/* Active Filters */}
              {activeFiltersCount > 0 && (
                <div className="mb-6 pb-6 border-b">
                  <div className="flex flex-wrap gap-2">
                    {filters.category && (
                      <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                        {
                          categories.find(c => c.slug === filters.category)
                            ?.name
                        }
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleFilterChange('category', undefined)
                          }
                          className="h-4 w-4 p-0 hover:bg-transparent"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </span>
                    )}
                    {filters.subcategory && (
                      <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                        {
                          subcategories.find(
                            s => s.slug === filters.subcategory
                          )?.name
                        }
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleFilterChange('subcategory', undefined)
                          }
                          className="h-4 w-4 p-0 hover:bg-transparent"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </span>
                    )}
                    {(filters.minPrice || filters.maxPrice) && (
                      <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                        ৳{filters.minPrice || 0} - ৳{filters.maxPrice || 'Max'}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            handleFilterChange('minPrice', undefined)
                            handleFilterChange('maxPrice', undefined)
                            setPriceRange({ min: '', max: '' })
                          }}
                          className="h-4 w-4 p-0 hover:bg-transparent"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </span>
                    )}
                    {filters.rating && (
                      <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                        {filters.rating}★ {'And Above'}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleFilterChange('rating', undefined)
                          }
                          className="h-4 w-4 p-0 hover:bg-transparent"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Category Filter */}
              <div className="mb-6 pb-6 border-b">
                <button
                  type="button"
                  onClick={() => toggleSection('category')}
                  className="flex items-center justify-between w-full mb-4 cursor-pointer"
                >
                  <h3 className="font-semibold text-gray-900">
                    {'Categories'}
                  </h3>
                  {expandedSections.category ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>
                {expandedSections.category && (
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {categories.map(category => (
                      <div
                        key={category.id}
                        className="flex items-center gap-3 cursor-pointer group"
                        onClick={() => {
                          const newFilters = { ...filters }
                          if (filters.category === category.slug) {
                            delete newFilters.category
                            delete newFilters.subcategory
                          } else {
                            newFilters.category = category.slug
                            delete newFilters.subcategory
                          }
                          setFilters(newFilters)
                          updateURL(newFilters)
                        }}
                      >
                        <input
                          type="radio"
                          name="category"
                          value={category.slug}
                          checked={filters.category === category.slug}
                          onChange={() => {}}
                          className="w-4 h-4 text-primary focus:ring-primary border-gray-300 pointer-events-none"
                        />
                        <span className="text-sm text-gray-700 group-hover:text-primary flex-1">
                          {category.name}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Subcategory Filter */}
              {filters.category && filteredSubcategories.length > 0 && (
                <div className="mb-6 pb-6 border-b">
                  <button
                    type="button"
                    onClick={() => toggleSection('subcategory')}
                    className="flex items-center justify-between w-full mb-4 cursor-pointer"
                  >
                    <h3 className="font-semibold text-gray-900">
                      {'Subcategory'}
                    </h3>
                    {expandedSections.subcategory ? (
                      <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                  </button>
                  {expandedSections.subcategory && (
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {filteredSubcategories.map(subcategory => (
                        <div
                          key={subcategory.id}
                          className="flex items-center gap-3 cursor-pointer group"
                          onClick={() => {
                            if (filters.subcategory === subcategory.slug) {
                              handleFilterChange('subcategory', undefined)
                            } else {
                              handleFilterChange(
                                'subcategory',
                                subcategory.slug
                              )
                            }
                          }}
                        >
                          <input
                            type="radio"
                            name="subcategory"
                            value={subcategory.slug}
                            checked={filters.subcategory === subcategory.slug}
                            onChange={() => {}}
                            className="w-4 h-4 text-primary focus:ring-primary border-gray-300 pointer-events-none"
                          />
                          <span className="text-sm text-gray-700 group-hover:text-primary flex-1">
                            {subcategory.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Price Range Filter */}
              <div className="mb-6 pb-6 border-b">
                <div
                  onClick={() => toggleSection('price')}
                  className="flex items-center justify-between w-full mb-4 cursor-pointer"
                >
                  <h3 className="font-semibold text-gray-900">
                    {'Price Range'}
                  </h3>
                  {expandedSections.price ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </div>
                {expandedSections.price && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm text-gray-500 mb-2">
                      <span>৳{minProductPrice}</span> -{' '}
                      <span>৳{maxProductPrice}</span>
                    </div>
                    <div className="flex flex-col gap-3">
                      <Input
                        type="number"
                        placeholder={'Min Price'}
                        value={priceRange.min}
                        onChange={e =>
                          setPriceRange({ ...priceRange, min: e.target.value })
                        }
                      />
                      <Input
                        type="number"
                        placeholder={'Max Price'}
                        value={priceRange.max}
                        onChange={e =>
                          setPriceRange({ ...priceRange, max: e.target.value })
                        }
                      />
                    </div>
                    <Button onClick={handlePriceFilter} className="w-full">
                      {'Apply'}
                    </Button>
                  </div>
                )}
              </div>

              {/* Rating Filter */}
              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => toggleSection('rating')}
                  className="flex items-center justify-between w-full mb-4 cursor-pointer"
                >
                  <h3 className="font-semibold text-gray-900">{'Rating'}</h3>
                  {expandedSections.rating ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>
                {expandedSections.rating && (
                  <div className="space-y-3">
                    {[5, 4, 3, 2, 1].map(rating => (
                      <div
                        key={rating}
                        className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition group"
                        onClick={() => {
                          if (filters.rating === rating.toString()) {
                            handleFilterChange('rating', undefined)
                          } else {
                            handleFilterChange('rating', rating.toString())
                          }
                        }}
                      >
                        <input
                          type="radio"
                          name="rating"
                          value={rating.toString()}
                          checked={filters.rating === rating.toString()}
                          onChange={() => {}}
                          className="w-4 h-4 text-primary focus:ring-primary border-gray-300 shrink-0 pointer-events-none"
                        />
                        <div className="flex items-center gap-1 flex-1">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                          <span className="text-sm text-gray-600 ml-1">
                            {'And Above'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {/* Mobile Sort */}
            <div className="md:hidden mb-4">
              <select
                value={filters.sort || ''}
                onChange={e =>
                  handleFilterChange('sort', e.target.value || undefined)
                }
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">{'Sort Newest'}</option>
                <option value="price-asc">{'Sort Price Low High'}</option>
                <option value="price-desc">{'Sort Price High Low'}</option>
                <option value="rating">{'Sort Rating'}</option>
                <option value="name-asc">{'Sort Name A Z'}</option>
              </select>
            </div>

            {initialProducts.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <p className="text-gray-600 text-lg">{'No Products'}</p>
                <Button variant="link" onClick={clearFilters} className="mt-4">
                  {'Reset Filters'}
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {products.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        setCurrentPage(prev => Math.max(1, prev - 1))
                      }
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        page => {
                          // Show first page, last page, current page, and pages around current
                          const showPage =
                            page === 1 ||
                            page === totalPages ||
                            (page >= currentPage - 1 && page <= currentPage + 1)

                          if (!showPage) {
                            // Show ellipsis
                            if (
                              page === currentPage - 2 ||
                              page === currentPage + 2
                            ) {
                              return (
                                <span key={page} className="px-2 text-gray-500">
                                  ...
                                </span>
                              )
                            }
                            return null
                          }

                          return (
                            <Button
                              key={page}
                              variant={
                                currentPage === page ? 'default' : 'outline'
                              }
                              size="icon"
                              onClick={() => setCurrentPage(page)}
                              className="w-10 h-10"
                            >
                              {page}
                            </Button>
                          )
                        }
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        setCurrentPage(prev => Math.min(totalPages, prev + 1))
                      }
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowMobileFilters(false)}
          />
          <div className="absolute inset-y-0 right-0 w-full max-w-sm bg-white shadow-xl overflow-y-auto">
            <div className="p-6">
              {/* Mobile Filter Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">{'Filters'}</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowMobileFilters(false)}
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>

              {/* Same filter content as desktop */}
              <div className="space-y-6">
                {/* Active Filters */}
                {activeFiltersCount > 0 && (
                  <div className="pb-6 border-b">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="text-sm text-primary hover:text-primary/80 font-medium mb-3 h-auto p-0"
                    >
                      {'Reset Filters'}
                    </Button>
                    <div className="flex flex-wrap gap-2">
                      {filters.category && (
                        <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                          {
                            categories.find(c => c.slug === filters.category)
                              ?.name
                          }
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              handleFilterChange('category', undefined)
                            }
                            className="h-4 w-4 p-0 hover:bg-transparent"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Category Filter - Mobile */}
                <div className="pb-6 border-b">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    {'Categories'}
                  </h3>
                  <div className="space-y-3">
                    {categories.map(category => (
                      <div
                        key={category.id}
                        className="flex items-center gap-3 cursor-pointer group"
                        onClick={() => {
                          const newFilters = { ...filters }
                          if (filters.category === category.slug) {
                            delete newFilters.category
                            delete newFilters.subcategory
                          } else {
                            newFilters.category = category.slug
                            delete newFilters.subcategory
                          }
                          setFilters(newFilters)
                          updateURL(newFilters)
                        }}
                      >
                        <input
                          type="radio"
                          name="category-mobile"
                          value={category.slug}
                          checked={filters.category === category.slug}
                          onChange={() => {}}
                          className="w-4 h-4 text-primary focus:ring-primary border-gray-300 pointer-events-none"
                        />
                        <span className="text-sm text-gray-700 group-hover:text-primary flex-1">
                          {category.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Subcategory - Mobile */}
                {filters.category && filteredSubcategories.length > 0 && (
                  <div className="pb-6 border-b">
                    <h3 className="font-semibold text-gray-900 mb-4">
                      {'Subcategory'}
                    </h3>
                    <div className="space-y-3">
                      {filteredSubcategories.map(subcategory => (
                        <div
                          key={subcategory.id}
                          className="flex items-center gap-3 cursor-pointer group"
                          onClick={() => {
                            if (filters.subcategory === subcategory.slug) {
                              handleFilterChange('subcategory', undefined)
                            } else {
                              handleFilterChange(
                                'subcategory',
                                subcategory.slug
                              )
                            }
                          }}
                        >
                          <input
                            type="radio"
                            name="subcategory-mobile"
                            value={subcategory.slug}
                            checked={filters.subcategory === subcategory.slug}
                            onChange={() => {}}
                            className="w-4 h-4 text-primary focus:ring-primary border-gray-300 pointer-events-none"
                          />
                          <span className="text-sm text-gray-700 group-hover:text-primary flex-1">
                            {subcategory.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Price Range - Mobile */}
                <div className="pb-6 border-b">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    {'Price Range'}
                  </h3>
                  <div className="space-y-4">
                    <div className="text-xs text-gray-500">
                      ৳{minProductPrice} - ৳{maxProductPrice}
                    </div>
                    <div className="flex gap-3">
                      <Input
                        type="number"
                        placeholder={'Min Price'}
                        value={priceRange.min}
                        onChange={e =>
                          setPriceRange({ ...priceRange, min: e.target.value })
                        }
                        className="flex-1 h-10"
                      />
                      <Input
                        type="number"
                        placeholder={'Max Price'}
                        value={priceRange.max}
                        onChange={e =>
                          setPriceRange({ ...priceRange, max: e.target.value })
                        }
                        className="flex-1 h-10"
                      />
                    </div>
                    <Button onClick={handlePriceFilter} className="w-full">
                      {'Apply'}
                    </Button>
                  </div>
                </div>

                {/* Rating Filter - Mobile */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">
                    {'Rating'}
                  </h3>
                  <div className="space-y-3">
                    {[5, 4, 3, 2, 1].map(rating => (
                      <div
                        key={rating}
                        className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition group"
                        onClick={() => {
                          if (filters.rating === rating.toString()) {
                            handleFilterChange('rating', undefined)
                          } else {
                            handleFilterChange('rating', rating.toString())
                          }
                        }}
                      >
                        <input
                          type="radio"
                          name="rating-mobile"
                          value={rating.toString()}
                          checked={filters.rating === rating.toString()}
                          onChange={() => {}}
                          className="w-4 h-4 text-primary focus:ring-primary border-gray-300 shrink-0 pointer-events-none"
                        />
                        <div className="flex items-center gap-1 flex-1">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                          <span className="text-sm text-gray-600 ml-1">
                            {'And Above'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Apply Button */}
              <Button
                onClick={() => setShowMobileFilters(false)}
                className="w-full mt-6 font-semibold"
                size="lg"
              >
                {'Apply Filters'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
