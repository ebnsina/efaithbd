'use client'

import { useRef } from 'react'
import ProductCard from './ProductCard'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  comparePrice: number | null
  images: string[]
  stock: number
}

interface ProductCarouselProps {
  title: string
  products: Product[]
}

export default function ProductCarousel({
  title,
  products,
}: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300
      const newScrollLeft =
        scrollRef.current.scrollLeft +
        (direction === 'left' ? -scrollAmount : scrollAmount)
      scrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth',
      })
    }
  }

  if (products.length === 0) {
    return null
  }

  return (
    <section className="py-8">
      <div className="container mx-auto px-2 md:px-0">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl md:text-2xl font-semibold">{title}</h2>

          {/* Scroll Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => scroll('left')}
              className="p-2.5 rounded-full bg-gray-100 shop-hover-primary transition-all duration-200 active:scale-95"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-2.5 rounded-full bg-gray-100 shop-hover-primary transition-all duration-200 active:scale-95"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Product Carousel */}
        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {products.map(product => (
            <div key={product.id} className="shrink-0 w-64 shop-animate-in">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
