import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { AdminLayoutClient } from './layout-client'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  // Redirect to admin login if not authenticated or not admin
  if (!session || session.user?.role !== 'ADMIN') {
    redirect('/auth/admin-login')
  }

  return <AdminLayoutClient session={session}>{children}</AdminLayoutClient>
}
