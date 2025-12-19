import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import { getSiteSettings } from '@/lib/site-settings'
import { prisma } from '@/lib/prisma'
import { QueryProvider } from '@/providers/query-provider'
import { Toaster } from 'sonner'

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const settings = await getSiteSettings()

  const menuItems = await prisma.menuItem.findMany({
    where: {
      active: true,
      parentId: null,
    },
    include: {
      children: {
        where: { active: true },
        orderBy: { order: 'asc' },
      },
    },
    orderBy: { order: 'asc' },
  })

  return (
    <QueryProvider>
      <Navbar
        siteName={settings?.siteName || 'Online Store'}
        logo={settings?.logo}
        promoText={settings?.promoText}
        promoActive={settings?.promoActive}
        menuItems={menuItems}
      />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <Toaster position="top-center" richColors />
    </QueryProvider>
  )
}
