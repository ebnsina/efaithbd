'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import Image from 'next/image'
import { Loader2 } from 'lucide-react'

export default function CategoriesPage() {
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await fetch('/api/admin/categories')
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json()
    },
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {'Categories'}
          </h1>
          <p className="text-gray-600">{'Find Favorite Products'}</p>
        </div>

        {/* Categories Grid */}
        {categories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">{'No Products'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {categories.map((category: any) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
              >
                {/* Image Container */}
                <div className="relative w-full aspect-square bg-gray-100">
                  {category.image ? (
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <img
                        src="https://cdn-icons-png.flaticon.com/512/7183/7183999.png"
                        alt=""
                        className="w-20 h-20 opacity-30"
                      />
                    </div>
                  )}
                </div>

                {/* Category Info */}
                <div className="p-4 text-center">
                  <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {`${category._count?.products || 0} ${
                      category._count?.products === 1 ? 'product' : 'products'
                    }`}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
