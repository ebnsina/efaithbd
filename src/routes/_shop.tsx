import { createFileRoute, Outlet } from '@tanstack/react-router'
import { Footer } from '@/features/shop-layout/footer'
import { Navbar } from '@/features/shop-layout/navbar'
import { shopLayoutQuery } from '@/features/shop-layout/queries'
import { getShopUser } from '@/features/shop-layout/shop-layout.functions'

export const Route = createFileRoute('/_shop')({
  // The signed-in user comes straight from the loader, so router.invalidate() after login or logout refreshes it
  loader: async ({ context }) => {
    const [user] = await Promise.all([getShopUser(), context.queryClient.ensureQueryData(shopLayoutQuery)])
    return { user }
  },
  staleTime: 30_000,
  component: ShopLayout,
})

function ShopLayout() {
  const { user } = Route.useLoaderData()
  return (
    <>
      <Navbar user={user} />
      <main className="min-h-[60vh]">
        <Outlet />
      </main>
      <Footer />
    </>
  )
}
