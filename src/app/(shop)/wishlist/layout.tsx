import { getSiteSettings } from '@/lib/site-settings'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  const siteName = settings?.siteName || 'Online Store'
  
  return {
    title: `Wishlist - ${siteName}`,
    description: `Your wishlist at ${siteName}. Save your favorite products for later.`,
    robots: {
      index: false,
      follow: false,
    },
  }
}

export default function WishlistLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

