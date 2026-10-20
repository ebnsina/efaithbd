import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import { getSiteSettings } from '@/lib/site-settings'
import { prisma } from '@/lib/prisma'
import { QueryProvider } from '@/providers/query-provider'
import { Toaster } from 'sonner'

// Shop pages are cached and rebuilt in the background; admin edits show up within a minute
export const revalidate = 60

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [settings, menuItems, categories] = await Promise.all([
    getSiteSettings(),
    prisma.menuItem.findMany({
      where: { active: true, parentId: null },
      include: { children: { where: { active: true }, orderBy: { order: 'asc' } } },
      orderBy: { order: 'asc' },
    }),
    prisma.category.findMany({
      include: { subcategories: { orderBy: { name: 'asc' } } },
      orderBy: { name: 'asc' },
    }),
  ])

  return (
    <QueryProvider>
      <Navbar
        siteName={settings?.siteName || 'Online Store'}
        logo={settings?.logo}
        promoText={settings?.promoText}
        promoActive={settings?.promoActive}
        menuItems={menuItems}
        categories={categories}
      />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <Toaster position="top-center" richColors />
    </QueryProvider>
  )
}
