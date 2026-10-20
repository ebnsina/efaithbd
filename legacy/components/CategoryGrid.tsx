import Link from 'next/link'
import Image from 'next/image'

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
  if (categories.length === 0) {
    return null
  }

  return (
    <section className="bg-white border-b border-slate-200">
      <div className="container mx-auto px-4 sm:px-6">
        <div
          className="flex justify-between gap-4 overflow-x-auto py-4 scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${category.slug}`}
              className="group shrink-0 flex flex-col items-center gap-2"
            >
              <div className="relative size-20 rounded-full overflow-hidden bg-primary/10">
                {category.image ? (
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center p-6">
                    <img
                      src="https://cdn-icons-png.flaticon.com/512/7183/7183999.png"
                      alt=""
                      className="w-full h-full object-contain opacity-60"
                    />
                  </div>
                )}
              </div>

              <h3 className="text-[11px] font-bold uppercase tracking-wide text-gray-800 text-center whitespace-nowrap group-hover:text-primary">
                {category.name}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
