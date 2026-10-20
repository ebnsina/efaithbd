import { getSiteSettings } from '@/lib/site-settings'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  const siteName = settings?.siteName || 'Online Store'
  
  return {
    title: `Shopping Cart - ${siteName}`,
    description: `View your shopping cart at ${siteName}. Review items before checkout.`,
    robots: {
      index: false,
      follow: false,
    },
  }
}

export default function CartLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

