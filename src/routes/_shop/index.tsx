import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Fragment } from 'react'
import { BannerCarousel, CategoryStrip, FeatureCards, HighlightStrip, MidBanner, ProductRow } from '@/features/catalog/home'
import { homepageQuery } from '@/features/catalog/queries'

export const Route = createFileRoute('/_shop/')({
  loader: ({ context }) => context.queryClient.ensureQueryData(homepageQuery),
  component: HomePage,
})

function HomePage() {
  const { data } = useSuspenseQuery(homepageQuery)
  // A mid banner's position is the section it follows; positions past the last section go at the end
  const after = (position: number) => data.midBanners.filter((banner) => banner.position === position)
  const leftover = data.midBanners.filter((banner) => banner.position > data.sections.length || banner.position < 1)

  return (
    <div className="pb-4">
      <CategoryStrip categories={data.categories} />
      <BannerCarousel banners={data.banners} />
      <HighlightStrip highlights={data.highlights} />
      {data.sections.map((section, i) => (
        <Fragment key={section.id}>
          <ProductRow section={section} />
          {after(i + 1).map((banner) => (
            <MidBanner key={banner.id} banner={banner} />
          ))}
        </Fragment>
      ))}
      {leftover.map((banner) => (
        <MidBanner key={banner.id} banner={banner} />
      ))}
      <FeatureCards cards={data.featureCards} />
    </div>
  )
}
