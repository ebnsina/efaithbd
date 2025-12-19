'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRef } from 'react'
import { Button } from '@/components/ui/button'

interface Category {
  id: string
  name: string
  slug: string
  image?: string | null
}

interface CategoryGridProps {
  categories: Category[]
}

export default function CategoryGrid({ categories }: CategoryGridProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  if (categories.length === 0) {
    return null
  }

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400
      const newScrollLeft =
        scrollContainerRef.current.scrollLeft +
        (direction === 'left' ? -scrollAmount : scrollAmount)
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth',
      })
    }
  }

  return (
    <section className="bg-white py-6">
      <div className="container mx-auto px-2 md:px-0">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-xl md:text-2xl font-semibold">
            Shop by Category
          </h2>
          <div className="flex gap-2">
            <Button
              onClick={() => scroll('left')}
              variant="ghost"
              size="icon-sm"
              className="bg-gray-100 shop-hover-primary"
              aria-label="Scroll left"
            >
              <ChevronLeft className="size-5" />
            </Button>
            <Button
              onClick={() => scroll('right')}
              variant="ghost"
              size="icon-sm"
              className="bg-gray-100 shop-hover-primary"
              aria-label="Scroll right"
            >
              <ChevronRight className="size-5" />
            </Button>
          </div>
        </div>

        {/* Horizontal Scroll Layout */}
        <div
          ref={scrollContainerRef}
          className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {categories.map((category, index) => {
            return (
              <Link
                key={category.id}
                href={`/products?category=${category.slug}`}
                className="shrink-0 flex flex-col items-center"
              >
                {/* Rounded Rectangle Card */}
                <div
                  className={`relative size-32 border border-slate-100 rounded-full overflow-hidden mb-4`}
                >
                  {category.image ? (
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover rounded-2xl"
                    />
                  ) : (
                    <div className="w-full h-full flex rounded-full overflow-hidden items-center justify-center p-6">
                      <img
                        src="https://cdn-icons-png.flaticon.com/512/7183/7183999.png"
                        alt=""
                        className="w-full h-full object-contain opacity-60"
                      />
                    </div>
                  )}
                </div>

                {/* Category Name */}
                <h3 className="text-base md:text-base font-semibold text-gray-900 text-center max-w-48 px-2">
                  {category.name}
                </h3>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
