import { getSiteSettings } from '@/lib/site-settings'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  const siteName = settings?.siteName || 'Online Store'
  
  return {
    title: `Checkout - ${siteName}`,
    description: `Complete your order at ${siteName}. Secure checkout process.`,
    robots: {
      index: false,
      follow: false,
    },
  }
}

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

