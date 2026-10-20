import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { DbLink } from '@/features/shop-layout/db-link'
import { cn } from '@/lib/utils'
import type { getHomepage } from './catalog.functions'
import { StoreIcon } from './icons'
import { imageSrc } from './image'
import { ProductCard } from './product-card'

type Homepage = Awaited<ReturnType<typeof getHomepage>>

function MaybeLink({ url, className, children }: { url: string | null; className?: string; children: React.ReactNode }) {
  return url ? (
    <DbLink url={url} className={className}>
      {children}
    </DbLink>
  ) : (
    <div className={className}>{children}</div>
  )
}

function BannerText({ title, subtitle, as: Heading }: { title: string | null; subtitle: string | null; as: 'h1' | 'h2' }) {
  if (!title && !subtitle) return null
  return (
    <div className="absolute inset-0 flex items-center bg-linear-to-r from-black/60 via-black/25 to-transparent">
      <div className="max-w-xl px-6 text-white sm:px-12 md:px-16">
        {title && <Heading className="font-bold text-xl leading-tight drop-shadow sm:text-3xl md:text-5xl">{title}</Heading>}
        {subtitle && <p className="mt-2 text-sm drop-shadow sm:text-lg md:text-xl">{subtitle}</p>}
      </div>
    </div>
  )
}

export function CategoryStrip({ categories }: { categories: Homepage['categories'] }) {
  if (categories.length === 0) return null
  return (
    <section aria-label="Shop by category" className="border-b bg-background">
      <ul className="container mx-auto flex gap-4 overflow-x-auto px-4 py-4 [scrollbar-width:none] lg:justify-between">
        {categories.map((category) => (
          <li key={category.id} className="shrink-0">
            <Link
              to="/categories/$slug"
              params={{ slug: category.slug }}
              className="group flex w-20 flex-col items-center gap-2 text-center"
            >
              <span className="flex size-20 items-center justify-center overflow-hidden rounded-full bg-primary/10 font-semibold text-2xl text-primary">
                {category.image ? (
                  <img
                    src={imageSrc(category.image, 160)}
                    alt=""
                    width={80}
                    height={80}
                    loading="lazy"
                    decoding="async"
                    className="size-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  category.name.charAt(0)
                )}
              </span>
              <span className="line-clamp-2 font-medium text-xs group-hover:text-primary">{category.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function BannerCarousel({ banners }: { banners: Homepage['banners'] }) {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (!api) return
    const onSelect = () => setCurrent(api.selectedScrollSnap())
    api.on('select', onSelect)
    return () => {
      api.off('select', onSelect)
    }
  }, [api])

  useEffect(() => {
    if (!api || paused || banners.length < 2) return
    const timer = setInterval(() => api.scrollNext(), 5000)
    return () => clearInterval(timer)
  }, [api, paused, banners.length])

  if (banners.length === 0) return null
  return (
    <section aria-label="Offers" className="container mx-auto px-4 pt-6">
      <Carousel
        setApi={setApi}
        opts={{ loop: true }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
      >
        <CarouselContent>
          {banners.map((banner, i) => (
            <CarouselItem key={banner.id}>
              <MaybeLink url={banner.link} className="relative block aspect-[16/7] overflow-hidden rounded-xl bg-muted md:aspect-[16/6]">
                <img
                  src={imageSrc(banner.image, 1600)}
                  alt={banner.title ?? ''}
                  width={1600}
                  height={600}
                  loading={i === 0 ? 'eager' : 'lazy'}
                  fetchPriority={i === 0 ? 'high' : 'auto'}
                  decoding="async"
                  className="absolute inset-0 size-full object-cover"
                />
                <BannerText title={banner.title} subtitle={banner.subtitle} as={i === 0 ? 'h1' : 'h2'} />
              </MaybeLink>
            </CarouselItem>
          ))}
        </CarouselContent>
        {banners.length > 1 && (
          <>
            <CarouselPrevious className="left-3 hidden bg-background/90 sm:flex" />
            <CarouselNext className="right-3 hidden bg-background/90 sm:flex" />
            <div className="-translate-x-1/2 absolute bottom-3 left-1/2 flex gap-2">
              {banners.map((banner, i) => (
                <button
                  key={banner.id}
                  type="button"
                  aria-label={`Show slide ${i + 1}`}
                  aria-current={i === current}
                  onClick={() => api?.scrollTo(i)}
                  className={cn('h-2 rounded-full bg-white/60 transition-all', i === current ? 'w-6 bg-white' : 'w-2')}
                />
              ))}
            </div>
          </>
        )}
      </Carousel>
    </section>
  )
}

export function HighlightStrip({ highlights }: { highlights: Homepage['highlights'] }) {
  if (highlights.length === 0) return null
  return (
    <section aria-label="Why shop with us" className="container mx-auto px-4 pt-6">
      <ul className="grid grid-cols-2 gap-4 rounded-xl border bg-card p-4 sm:p-5 lg:grid-cols-4">
        {highlights.map((highlight) => (
          <li key={highlight.id}>
            <MaybeLink url={highlight.link} className="flex items-center gap-3 hover:text-primary">
              <StoreIcon value={highlight.icon} className="size-8 shrink-0 text-2xl text-muted-foreground" />
              <span className="min-w-0">
                <span className="block font-semibold text-sm">{highlight.title}</span>
                {highlight.subtitle && <span className="block text-muted-foreground text-xs">{highlight.subtitle}</span>}
              </span>
            </MaybeLink>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function ProductRow({ section }: { section: Homepage['sections'][number] }) {
  if (section.products.length === 0) return null
  return (
    <section className="container mx-auto px-4 pt-10" aria-labelledby={`section-${section.id}`}>
      <Carousel opts={{ align: 'start' }}>
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 id={`section-${section.id}`} className="font-semibold text-xl md:text-2xl">
            {section.title}
          </h2>
          <div className="flex gap-2">
            <CarouselPrevious className="static translate-none" />
            <CarouselNext className="static translate-none" />
          </div>
        </div>
        <CarouselContent>
          {section.products.map((product) => (
            <CarouselItem key={product.id} className="basis-1/2 sm:basis-1/3 lg:basis-1/4 xl:basis-1/5">
              <ProductCard product={product} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  )
}

export function MidBanner({ banner }: { banner: Homepage['midBanners'][number] }) {
  return (
    <section className="container mx-auto px-4 pt-10">
      <MaybeLink url={banner.link} className="relative block aspect-[16/7] overflow-hidden rounded-xl bg-muted md:aspect-[16/5]">
        <img
          src={imageSrc(banner.image, 1600)}
          alt={banner.title ?? ''}
          width={1600}
          height={500}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 size-full object-cover"
        />
        <BannerText title={banner.title} subtitle={banner.subtitle} as="h2" />
      </MaybeLink>
    </section>
  )
}

export function FeatureCards({ cards }: { cards: Homepage['featureCards'] }) {
  if (cards.length === 0) return null
  return (
    <section aria-label="Our promise" className="container mx-auto px-4 pt-12">
      <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {cards.map((card) => (
          <li key={card.id} className="flex flex-col items-center gap-2 rounded-xl border bg-card p-5 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-muted text-2xl">
              <StoreIcon value={card.icon} className="size-6" />
            </span>
            <h3 className="font-semibold">{card.title}</h3>
            {card.description && <p className="text-muted-foreground text-sm">{card.description}</p>}
          </li>
        ))}
      </ul>
    </section>
  )
}
