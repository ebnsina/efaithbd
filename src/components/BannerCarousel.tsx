'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Banner {
  id: string
  title?: string | null
  subtitle?: string | null
  image: string
  link?: string | null
}

interface BannerCarouselProps {
  banners: Banner[]
}

export default function BannerCarousel({ banners }: BannerCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (banners.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % banners.length)
    }, 5000) // Auto-play every 5 seconds

    return () => clearInterval(interval)
  }, [banners.length])

  const goToPrevious = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentIndex(prev => (prev === 0 ? banners.length - 1 : prev - 1))
  }

  const goToNext = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentIndex(prev => (prev + 1) % banners.length)
  }

  if (banners.length === 0) {
    return null
  }

  const currentBanner = banners[currentIndex]
  const content = (
    <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden rounded bg-gray-50">
      <Image
        src={currentBanner.image}
        alt={currentBanner.title || 'Banner'}
        fill
        className="object-cover"
        priority
        sizes="100vw"
      />

      {/* Subtle Gradient Overlay */}
      <div className="absolute inset-0 bg-linear-to-r from-black/50 via-black/20 to-transparent" />

      {/* Text Overlay */}
      <div className="absolute inset-0 flex items-center">
        <div className="container mx-auto px-8 md:px-12">
          <div className="max-w-xl text-white">
            {currentBanner.title && (
              <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg leading-tight">
                {currentBanner.title}
              </h1>
            )}
            {currentBanner.subtitle && (
              <p className="text-lg md:text-xl mb-8 drop-shadow-md font-light opacity-95">
                {currentBanner.subtitle}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <Button
            onClick={goToPrevious}
            variant="secondary"
            size="icon-sm"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white backdrop-blur-sm border-0 shadow-lg hover:shadow-xl"
          >
            <ChevronLeft className="size-6" />
          </Button>
          <Button
            onClick={goToNext}
            variant="secondary"
            size="icon-sm"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white backdrop-blur-sm border-0 shadow-lg hover:shadow-xl"
          >
            <ChevronRight className="size-6" />
          </Button>
        </>
      )}

      {/* Dots Indicator */}
      {banners.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {banners.map((_, index) => (
            <Button
              key={index}
              variant="ghost"
              size="icon"
              onClick={e => {
                e.preventDefault()
                e.stopPropagation()
                setCurrentIndex(index)
              }}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-white w-8'
                  : 'bg-white/60 w-2 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )

  return currentBanner.link ? (
    <Link href={currentBanner.link}>{content}</Link>
  ) : (
    content
  )
}
