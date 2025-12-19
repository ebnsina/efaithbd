import Link from 'next/link'
import Image from 'next/image'

interface MidBannerProps {
  title?: string | null
  subtitle?: string | null
  image: string
  link?: string | null
}

export default function MidBanner({
  title,
  subtitle,
  image,
  link,
}: MidBannerProps) {
  const content = (
    <div className="relative w-full h-[300px] md:h-[400px] lg:h-[500px] overflow-hidden rounded-lg bg-gray-200">
      <Image
        src={image}
        alt={title || 'Banner'}
        fill
        className="object-cover"
        priority={false}
        sizes="100vw"
        unoptimized
      />

      {/* Gradient Overlay for better text readability */}
      <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/40 to-transparent" />

      {/* Text Overlay */}
      <div className="absolute inset-0 flex items-center">
        <div className="container mx-auto px-16 md:px-20 lg:px-24">
          <div className="max-w-2xl text-white">
            {title && (
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 drop-shadow-lg">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-lg md:text-xl lg:text-2xl mb-6 drop-shadow-md">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        {link ? (
          <Link
            href={link}
            className="block hover:opacity-95 transition-opacity"
          >
            {content}
          </Link>
        ) : (
          content
        )}
      </div>
    </section>
  )
}
