import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { getCurrentUser } from '@/features/auth/auth.functions'
import { AdminLayout } from '@/features/admin-shell/admin-layout'
import { siteSettingsQuery } from '@/features/settings/queries'

export const Route = createFileRoute('/admin')({
  // Server functions re-check the role on every call; this only decides which screen to show
  beforeLoad: async () => {
    const user = await getCurrentUser()
    if (user?.role !== 'ADMIN') throw redirect({ to: '/auth/admin-login' })
    return { user }
  },
  head: () => ({ meta: [{ name: 'robots', content: 'noindex' }] }),
  component: AdminRoute,
})

function AdminRoute() {
  const { user } = Route.useRouteContext()
  const { data: settings } = useSuspenseQuery(siteSettingsQuery)
  return (
    <AdminLayout user={user} siteName={settings?.siteName ?? ''}>
      <Outlet />
    </AdminLayout>
  )
}
